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

// Handler for POST requests to generate images
export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Invalid prompt provided' },
        { status: 400 }
      );
    }
    
    const key = await getImagineApiKey();
    const promptPrefix = "a pattern of  ";
    const mjParams = " --turbo --tile --stylize 200";
    const fullPrompt = promptPrefix + prompt + mjParams;
    
    console.log('path-------------',IMAGINE_API_URL, key);
    const response = await fetch(IMAGINE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store',
      body: JSON.stringify({ prompt: fullPrompt })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from Imagine API:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ requestId: data.data.id });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}