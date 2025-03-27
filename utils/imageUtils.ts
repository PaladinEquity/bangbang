/**
 * Utility functions for handling images
 */

/**
 * Fetches an image from a URL and returns it as a Blob
 * @param imageUrl The URL of the image to fetch
 * @returns Promise that resolves to a Blob of the image
 */
export async function fetchImageAsBlob(imageUrl: string): Promise<Blob> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    return await response.blob();
  } catch (error) {
    console.error('Error fetching image as blob:', error);
    throw new Error(`Image download failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Gets the MIME type from an image URL or defaults to a specified type
 * @param url The image URL
 * @param defaultType Default MIME type to use if detection fails
 * @returns The detected or default MIME type
 */
export function getMimeTypeFromUrl(url: string, defaultType = 'image/jpeg'): string {
  try {
    // Extract file extension from URL
    const extension = url.split('.').pop()?.toLowerCase();
    
    if (!extension) return defaultType;
    
    // Map common extensions to MIME types
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'avif': 'image/avif'
    };
    
    return mimeTypes[extension] || defaultType;
  } catch (error) {
    console.error('Error determining MIME type:', error);
    return defaultType;
  }
}