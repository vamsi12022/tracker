import { analyzeFood } from '@/lib/openai';
import { NextResponse } from 'next/server';

async function analyzeWithRetry(params, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await analyzeFood(params);
    } catch (error) {
      const isRateLimit =
        error.message?.includes('429') ||
        error.message?.includes('RATE_LIMIT') ||
        error.message?.includes('Resource has been exhausted') ||
        error.message?.includes('rate') ||
        error.status === 429;

      if (isRateLimit && attempt < maxRetries) {
        // Wait 5 seconds before retrying (increases per attempt)
        const waitMs = (attempt + 1) * 5000;
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      throw error;
    }
  }
}

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

    const result = await analyzeWithRetry({
      imageBase64: image,
      textInput: text,
      mimeType: mimeType || 'image/jpeg',
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);

    if (error.message?.includes('API_KEY')) {
      return NextResponse.json(
        { error: 'API key not configured. Please add OPENAI_API_KEY to your environment.' },
        { status: 500 }
      );
    }

    const isRateLimit =
      error.message?.includes('429') ||
      error.message?.includes('RATE_LIMIT') ||
      error.message?.includes('Resource has been exhausted') ||
      error.message?.includes('rate') ||
      error.status === 429;

    if (isRateLimit) {
      return NextResponse.json(
        { error: 'Rate limit reached. Please wait 30 seconds and try again. (Free tier: 15 requests/min)', retryAfter: 30 },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to analyze food. Please try again.' },
      { status: 500 }
    );
  }
}
