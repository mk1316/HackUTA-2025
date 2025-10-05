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
    const { text } = await request.json();

    // Validate text input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' }, 
        { status: 400 }
      );
    }

    // Validate API key presence
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.error('ELEVENLABS_API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'Audio service configuration error' }, 
        { status: 500 }
      );
    }

    // ElevenLabs API configuration
    const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Default voice
    const modelId = 'eleven_monolingual_v1'; // Fast model for better performance
    
    // Prepare request to ElevenLabs
    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      }
    );

    if (!elevenLabsResponse.ok) {
      const errorData = await elevenLabsResponse.text();
      console.error('ElevenLabs API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate audio' }, 
        { status: 500 }
      );
    }

    // Get the audio data
    const audioBuffer = await elevenLabsResponse.arrayBuffer();
    
    // Return the audio file
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
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
