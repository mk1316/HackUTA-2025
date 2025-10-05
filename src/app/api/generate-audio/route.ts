import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

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

    // Spawn Python script to generate audio (working_voice_summary.py behavior)
    const py = spawn('python3', ['ai_ml/main.py', '--mode', 'voice_summary', '--text', text || '']);

    const chunks: Buffer[] = [];
    let stderrBuf = '';
    py.stdout.on('data', (d) => chunks.push(Buffer.from(d)));
    py.stderr.on('data', (d) => { stderrBuf += d.toString(); });

    const exitCode: number = await new Promise((resolve) => {
      py.on('close', resolve);
    });

    if (exitCode !== 0) {
      console.error('voice summary script failed:', stderrBuf);
      return NextResponse.json({ error: 'Audio generation failed' }, { status: 500 });
    }

    const audioBuffer = Buffer.concat(chunks);
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
