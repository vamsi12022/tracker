import OpenAI from 'openai';

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
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('OPENAI_API_KEY is not configured. Please add your API key to .env.local');
  }

  const openai = new OpenAI({ apiKey });

  let userContent = [];

  if (imageBase64) {
    userContent = [
      {
        type: 'image_url',
        image_url: {
          url: `data:${mimeType};base64,${imageBase64}`,
          detail: 'low',
        },
      },
      {
        type: 'text',
        text: 'Analyze this food image and provide nutrition information.',
      },
    ];
  } else if (textInput) {
    userContent = [
      {
        type: 'text',
        text: `Analyze this food description and provide nutrition information: "${textInput}"`,
      },
    ];
  } else {
    throw new Error('Either an image or text input is required');
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 1024,
  });

  const text = response.choices[0]?.message?.content;

  if (!text) {
    throw new Error('No response from AI');
  }

  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

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
