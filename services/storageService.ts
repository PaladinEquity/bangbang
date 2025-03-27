'use client';

import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import { v4 as uuidv4 } from 'uuid';
import { databaseService } from './databaseService';

interface ImageUploadOptions {
  userId: string;
  projectId: string;
  imageBlob: Blob;
  mimeType: string;
  generationDescription: Record<string, any>;
  dimensions?: {
    width: number;
    height: number;
  };
  generateThumbnail?: boolean;
}

export const storageService = {
  /**
   * Upload an image to S3 storage and save its metadata to the database
   */
  async uploadWallpaperImage(options: ImageUploadOptions) {
    try {
      const {
        userId,
        projectId,
        imageBlob,
        mimeType,
        generationDescription,
        dimensions,
        generateThumbnail = false
      } = options;

      // Generate a unique storage key for the image
      const fileExtension = mimeType.split('/')[1] || 'jpg';
      const storageKey = `wallpapers/${userId}/${projectId}.${fileExtension}`;
      
      // Upload the image to S3
      await uploadData({
        key: storageKey,
        data: imageBlob,
        options: {
          contentType: mimeType,
          metadata: {
            userId,
            projectId
          }
        }
      });

      // Calculate file size in bytes
      const fileSize = imageBlob.size;

      // Generate and upload thumbnail if requested
      let thumbnailKey = null;
      if (generateThumbnail) {
        thumbnailKey = await this.generateAndUploadThumbnail(imageBlob, userId, projectId, mimeType);
      }

      // Save wallpaper data to database
      const wallpaperData = await databaseService.saveWallpaperData({
        projectId,
        userId,
        storageKey,
        mimeType,
        generationDescription,
        dimensions,
        fileSize,
        thumbnailKey : thumbnailKey || undefined,
        status: 'active'
      });

      return wallpaperData;
    } catch (error) {
      console.error('Error uploading wallpaper image:', error);
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Generate and upload a thumbnail version of the image
   */
  async generateAndUploadThumbnail(imageBlob: Blob, userId: string, projectId: string, mimeType: string) {
    try {
      // Create a smaller version of the image (thumbnail)
      const thumbnailBlob = await this.resizeImage(imageBlob, 300); // 300px width
      
      // Generate a unique storage key for the thumbnail
      const fileExtension = mimeType.split('/')[1] || 'jpg';
      const thumbnailKey = `wallpapers/${userId}/${projectId}_thumb.${fileExtension}`;
      
      // Upload the thumbnail to S3
      await uploadData({
        key: thumbnailKey,
        data: thumbnailBlob,
        options: {
          contentType: mimeType,
          metadata: {
            userId,
            projectId,
            isThumbnail: 'true'
          }
        }
      });

      return thumbnailKey;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return null; // Continue even if thumbnail generation fails
    }
  },

  /**
   * Resize an image to a specified width while maintaining aspect ratio
   */
  async resizeImage(blob: Blob, maxWidth: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions
        const aspectRatio = img.height / img.width;
        const width = Math.min(maxWidth, img.width);
        const height = width * aspectRatio;
        
        // Create canvas and resize
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // Draw resized image on canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert canvas to blob
        canvas.toBlob(
          (resizedBlob) => {
            if (resizedBlob) {
              resolve(resizedBlob);
            } else {
              reject(new Error('Failed to create thumbnail blob'));
            }
          },
          blob.type,
          0.8 // Quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image for resizing'));
      
      // Load image from blob
      img.src = URL.createObjectURL(blob);
    });
  },

  /**
   * Get a signed URL for accessing a wallpaper image
   */
  async getWallpaperUrl(storageKey: string, expiresIn = 3600) {
    try {
      const result = await getUrl({
        key: storageKey,
        options: {
          expiresIn // URL expiration time in seconds
        }
      });
      return result.url.toString();
    } catch (error) {
      console.error('Error getting wallpaper URL:', error);
      throw new Error(`Failed to get URL: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Delete a wallpaper image from storage
   */
  async deleteWallpaperImage(storageKey: string, thumbnailKey?: string | null) {
    try {
      // Delete main image
      await remove({ key: storageKey });
      
      // Delete thumbnail if it exists
      if (thumbnailKey) {
        await remove({ key: thumbnailKey });
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting wallpaper image:', error);
      throw new Error(`Delete failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};