import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

/**
 * API route for processing PDF files with Gemini AI
 * Handles file upload, validation, and AI-powered summarization
 * 
 * @param request - Next.js request object containing the uploaded file
 * @returns JSON response with AI-generated summary or error message
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

    // Prepare content for Gemini AI processing with syllabus extraction prompt
    const prompt = `
    Extract ALL assignments, exams, projects, and important dates from this syllabus PDF.
    
    FOCUS ON THE "ASSIGNMENTS" COLUMN - look for phrases like "Due by", "Assigned", and specific due dates.
    
    CRITICAL INSTRUCTIONS:
    1. Find EVERY assignment, homework, quiz with due dates (look for: "Team:", "Individual:", "HW:", "Assignment", "Assigned", "Due by",)
    2. Find ALL exams (Midterm, Finals, Reviews, etc.) and their dates
    3. Find ALL projects, presentations, reports, and their due dates
    4. Extract team member evaluations, sprint plans, sprint reviews, and any other graded work
    5. Include the full title/description for each item
    6. Convert all dates to YYYY-MM-DD format (assume year 2025 if not specified)
    7. If a date range is given (e.g., "8/18-8/22"), use the END date as the due date
    8. Pay special attention to items with time stamps like "11:59PM" - these are important deadlines
    
    Return ONLY valid JSON in this exact format (no markdown, no extra text):
    {
        "course_name": "Full Course Name",
        "course_code": "Course Code",
        "professor": {
            "name": "Professor Name",
            "email": "email@domain.com",
            "office_hours": "Office hours description"
        },
        "class_schedule": "Class meeting schedule",
        "homework": [
            {
                "title": "Assignment Title",
                "due_date": "YYYY-MM-DD",
                "description": "Assignment description"
            }
        ],
        "exams": [
            {
                "type": "Midterm/Final/Quiz",
                "date": "YYYY-MM-DD",
                "description": "Exam details"
            }
        ],
        "projects": [
            {
                "title": "Project Title",
                "due_date": "YYYY-MM-DD",
                "description": "Project description"
            }
        ]
    }
    `;

    const contents = [
      { 
        text: prompt
      },
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64
        }
      }
    ];

    // Generate AI-powered syllabus extraction using Gemini
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: contents
    });
    const rawResponse = result.text;

    // Parse the JSON response from Gemini
    let parsedData;
    try {
      // Validate response exists
      if (!rawResponse) {
        throw new Error('No response received from AI');
      }
      
      // Clean the response to extract only JSON (remove any markdown formatting)
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const jsonString = jsonMatch[0];
      parsedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      return NextResponse.json(
        { 
          error: 'Failed to parse AI response. Please try again.',
          success: false 
        },
        { status: 500 }
      );
    }

    // Return successful response with structured syllabus data
    return NextResponse.json({ 
      result: parsedData,
      success: true 
    });

  } catch (error) {
    // Log error for debugging
    console.error('Error processing PDF with Gemini AI:', error);
    
    // Return user-friendly error message
    return NextResponse.json(
      { 
        error: 'Failed to process PDF. Please try again.',
        success: false 
      },
      { status: 500 }
    );
  }
}
