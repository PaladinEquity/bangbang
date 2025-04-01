import { NextRequest, NextResponse } from 'next/server';


// This would be stored in environment variables in a production app
const IMAGINE_API_URL = process.env.IMAGINE_API_URL || 'https://cl.imagineapi.dev/items/images/';

// Function to get API key from environment variables
async function getImagineApiKey() {
  // In a real implementation, this would use environment variables
  // For development, you might want to use a .env.local file
  // return process.env.IMAGINE_API_KEY;
  
  // For demo purposes, we'll return a placeholder
  // You'll need to replace this with your actual API key
  return process.env.IMAGINE_API_KEY || 'imgn_wnafojyehxkrxlt65km7yilgr3adobwn';
}


// Handler for GET requests to retrieve generated images
export async function GET(request: NextRequest, { params }: any) {
  try {
    // Remove the await and use params directly
    const { id } = params;
    const requestId = id;
    
    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    const key = await getImagineApiKey();
    
    const response = await fetch(`${IMAGINE_API_URL}${requestId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from Imagine API:', errorData);
      return NextResponse.json(
        { error: 'Failed to get image results' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log('Imagine API response:', data); // Add logging to see the actual response structure
    
    // Check if the data structure is as expected
    if (!data.data) {
      return NextResponse.json(
        { error: 'Unexpected response format from Imagine API' },
        { status: 500 }
      );
    }
    
    // Check if the generation is complete
    if (data.data.status !== 'completed') {
      return NextResponse.json(
        { status: data.data.status, message: 'Image generation in progress' },
        { status: 202 } // Using 202 Accepted for in-progress operations
      );
    }
    
    return NextResponse.json({
      upscaled_urls: data.data.upscaled_urls || [],
      stitched_url: data.data.url
    });
  } catch (error) {
    console.error('Error getting image results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}