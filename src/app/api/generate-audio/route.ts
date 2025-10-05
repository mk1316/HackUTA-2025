import { NextRequest, NextResponse } from 'next/server';

/**
 * API route for generating audio from text using ElevenLabs
 * Converts humorous summary text to natural-sounding speech
 * 
 * @param request - Next.js request object containing the text to convert
 * @returns Audio file or error message
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { text } = body || {};

    // Check if ElevenLabs API key is available
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsApiKey) {
      return NextResponse.json(
        { 
          error: 'ElevenLabs API key not configured. Audio generation unavailable.',
          success: false 
        },
        { status: 503 }
      );
    }

    // Check if text is provided
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { 
          error: 'No text provided for audio generation',
          success: false 
        },
        { status: 400 }
      );
    }

    // Call ElevenLabs API directly
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      return NextResponse.json(
        { 
          error: 'Audio generation service temporarily unavailable',
          success: false 
        },
        { status: 503 }
      );
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    // Log error for debugging
    console.error('Error generating audio:', error);
    
    // Return user-friendly error message
    return NextResponse.json(
      { 
        error: 'Failed to generate audio. Please try again.',
        success: false 
      },
      { status: 500 }
    );
  }
}
