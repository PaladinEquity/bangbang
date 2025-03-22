import { NextRequest, NextResponse } from 'next/server';

// This would be stored in environment variables in a production app
const IMAGINE_API_URL = 'https://cl.imagineapi.dev/items/images/';

// Function to get API key from environment variables
async function getImagineApiKey() {
  // In a real implementation, this would use environment variables
  // return process.env.IMAGINE_API_KEY;
  
  // For demo purposes, we'll return a placeholder
  return 'imgn_wnafojyehxkrxlt65km7yilgr3adobwn';
}

// Handler for GET requests to check image generation status
export async function GET(request: NextRequest, { params }: any) {
  try {
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
        { error: 'Failed to get image status' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      status: data.data.status,
      progress: data.data.progress
    });
  } catch (error) {
    console.error('Error checking image status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}