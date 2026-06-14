import { analyzeFood } from '@/lib/gemini';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { image, text, mimeType } = body;

    if (!image && !text) {
      return NextResponse.json(
        { error: 'Please provide a food image or description' },
        { status: 400 }
      );
    }

    const result = await analyzeFood({
      imageBase64: image,
      textInput: text,
      mimeType: mimeType || 'image/jpeg',
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);

    if (error.message.includes('API_KEY')) {
      return NextResponse.json(
        { error: 'API key not configured. Please add GEMINI_API_KEY to your environment.' },
        { status: 500 }
      );
    }

    if (error.message.includes('RATE_LIMIT') || error.message.includes('429')) {
      return NextResponse.json(
        { error: 'Rate limit reached. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to analyze food. Please try again.' },
      { status: 500 }
    );
  }
}
