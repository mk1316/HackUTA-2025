import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

/**
 * API route for generating humorous summaries of syllabus PDFs
 * Creates funny, engaging summaries while maintaining course information
 * 
 * @param request - Next.js request object containing the uploaded file
 * @returns JSON response with humorous summary or error message
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract file from form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Validate file presence
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' }, 
        { status: 400 }
      );
    }

    // Validate file type - only PDF files are allowed
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' }, 
        { status: 400 }
      );
    }

    // Validate file size (optional - limit to 10MB)
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeInBytes) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' }, 
        { status: 400 }
      );
    }

    // Convert file to base64 for Gemini API
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Validate API key presence
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'API configuration error' }, 
        { status: 500 }
      );
    }

    // Initialize Gemini AI client
    const genAI = new GoogleGenAI({ apiKey });

    // Prepare content for humorous summary optimized for ElevenLabs audio generation
    const humorousPrompt = `
    Create a hilarious and entertaining AUDIO summary of this course syllabus that will be converted to speech using text-to-speech technology.
    
    CRITICAL INSTRUCTIONS FOR AUDIO GENERATION:
    1. Write in a conversational, spoken tone - like you're talking to a friend
    2. Use natural speech patterns and contractions (don't, can't, won't, etc.)
    3. Include natural pauses with ellipses or dashes for breathing
    4. Use expressive language that sounds good when spoken aloud
    5. Keep it between 2-3 minutes of speaking time (roughly 300-450 words)
    6. Start with an engaging hook like "Hey there, future student!"
    7. Use direct address ("you", "your") to make it personal
    8. Include natural speech fillers like "so", "well", "you know"
    9. End with an encouraging or humorous sign-off
    
    CONTENT FOCUS:
    - Course name and what you're actually getting into
    - The workload in relatable terms ("buckle up, buttercup")
    - Key deadlines and how to not get caught off guard
    - Professor info and any interesting policies
    - The most important assignments and how to tackle them
    - Any curveballs or surprises in the syllabus
    - Survival tips and encouragement
    
    TONE REQUIREMENTS:
    - Conversational and friendly, like a wise upperclassman
    - Humorous but not mean-spirited
    - Encouraging and supportive
    - Use college slang and references students will relate to
    - Make it sound natural when spoken, not like written text
    
    FORMAT FOR SPEECH:
    - Use short, punchy sentences
    - Include natural emphasis with ALL CAPS for important points
    - Use ellipses for natural pauses... like this
    - Include rhetorical questions to engage the listener
    - End with a memorable closing line
    
    Make it sound like a podcast episode about your class!
    `;

    const contents = [
      { 
        text: humorousPrompt
      },
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64
        }
      }
    ];

    // Generate humorous summary using Gemini
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: contents
    });
    const rawResponse = result.text;

    // Validate response exists
    if (!rawResponse) {
      throw new Error('No response received from AI');
    }

    // Return successful response with humorous summary
    return NextResponse.json({ 
      result: rawResponse,
      success: true 
    });

  } catch (error) {
    // Log error for debugging
    console.error('Error generating humorous summary:', error);
    
    // Return user-friendly error message
    return NextResponse.json(
      { 
        error: 'Failed to generate humorous summary. Please try again.',
        success: false 
      },
      { status: 500 }
    );
  }
}
