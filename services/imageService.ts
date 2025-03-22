/**
 * Service for handling image generation API calls
 */

// Send a request to generate images based on a prompt
export async function generateImages(prompt: string, styleOptions?: string, colorOptions?: string[]) {
  try {
    // Combine prompt with any additional options
    let fullPrompt = prompt;
    
    if (styleOptions && styleOptions.trim()) {
      fullPrompt += `, ${styleOptions} style`;
    }
    
    if (colorOptions && colorOptions.length > 0) {
      fullPrompt += `, with colors: ${colorOptions.join(', ')}`;
    }
    
    const response = await fetch('/api/imagine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: fullPrompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate images');
    }

    const data = await response.json();
    return data.requestId;
  } catch (error) {
    console.error('Error generating images:', error);
    throw error;
  }
}

// Check the status of an image generation request
export async function checkImageStatus(requestId: string) {
  try {
    const response = await fetch(`/api/imagine/status/${requestId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to check image status');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking image status:', error);
    throw error;
  }
}

// Get the results of a completed image generation request
export async function getImageResults(requestId: string) {
  try {
    const response = await fetch(`/api/imagine/results/${requestId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get image results');
    }

    const data = await response.json();
    return data.images;
  } catch (error) {
    console.error('Error getting image results:', error);
    throw error;
  }
}