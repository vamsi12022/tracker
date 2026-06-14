import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `You are a highly accurate nutrition expert AI agent. Your job is to analyze food and provide calorie and macro estimates.

RULES:
1. When given a food image, identify ALL food items visible in the image.
2. When given a text description, identify the food items mentioned.
3. Estimate realistic portion sizes based on typical servings.
4. Calculate calories, protein (g), carbs (g), and fat (g) for each item.
5. If you're uncertain, provide your best reasonable estimate.
6. Always respond with ONLY valid JSON — no markdown, no explanation, no code fences.

RESPONSE FORMAT (strict JSON):
{
  "foods": [
    {
      "name": "Food item name",
      "portion": "Estimated portion size (e.g., '1 cup', '200g')",
      "calories": 250,
      "protein": 12,
      "carbs": 30,
      "fat": 8
    }
  ],
  "totalCalories": 250,
  "totalProtein": 12,
  "totalCarbs": 30,
  "totalFat": 8,
  "mealType": "breakfast|lunch|dinner|snack",
  "confidence": "high|medium|low",
  "notes": "Brief note about the analysis"
}`;

export async function analyzeFood({ imageBase64, textInput, mimeType = 'image/jpeg' }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('GEMINI_API_KEY is not configured. Please add your API key to .env.local');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.3,
      topP: 0.8,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
    },
  });

  let parts = [];

  if (imageBase64) {
    parts = [
      {
        inlineData: {
          mimeType: mimeType,
          data: imageBase64,
        },
      },
      {
        text: SYSTEM_PROMPT + '\n\nAnalyze this food image and provide nutrition information.',
      },
    ];
  } else if (textInput) {
    parts = [
      {
        text: SYSTEM_PROMPT + `\n\nAnalyze this food description and provide nutrition information: "${textInput}"`,
      },
    ];
  } else {
    throw new Error('Either an image or text input is required');
  }

  const result = await model.generateContent(parts);
  const response = result.response;
  const text = response.text();

  try {
    // Clean the response — remove any markdown code fences if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Validate and ensure all required fields exist
    if (!parsed.foods || !Array.isArray(parsed.foods)) {
      throw new Error('Invalid response format');
    }

    // Recalculate totals for accuracy
    parsed.totalCalories = parsed.foods.reduce((sum, f) => sum + (f.calories || 0), 0);
    parsed.totalProtein = parsed.foods.reduce((sum, f) => sum + (f.protein || 0), 0);
    parsed.totalCarbs = parsed.foods.reduce((sum, f) => sum + (f.carbs || 0), 0);
    parsed.totalFat = parsed.foods.reduce((sum, f) => sum + (f.fat || 0), 0);

    return parsed;
  } catch (parseError) {
    console.error('Failed to parse AI response:', text);
    throw new Error('Failed to parse nutrition data from AI response');
  }
}
