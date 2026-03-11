import { GoogleGenAI } from "@google/genai";

export const analyzeStyle = async (imageBase64: string, gender: string) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) throw new Error("Gemini API key is missing. Please ensure it is set in the environment.");

  const ai = new GoogleGenAI({ apiKey });
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64.split(",")[1],
            },
          },
          {
            text: `You are a world-class fashion stylist. Analyze the person in this photo (specifically their skin tone and features) and provide personalized fashion advice for a ${gender}. 
            
            Please include:
            1. **Skin Tone Analysis**: Identify their skin tone (Fair, Medium, Olive, or Deep) and explain which color palettes complement it best.
            2. **Outfit Recommendations**: Suggest 3 specific outfit ideas (Casual, Professional, and Evening) including colors and fabrics.
            3. **Accessory Suggestions**: Recommend jewelry (gold vs silver), watches, and bags.
            4. **Hairstyle & Grooming**: Suggest hairstyles that would suit their face shape and overall vibe.
            5. **Shopping Guide**: Provide 3-5 generic shopping links or brand suggestions that fit this style (e.g., "Minimalist luxury like COS or Theory").
            
            Format the response in clean Markdown with clear headings.`,
          },
        ],
      },
    ],
  });

  const result = await model;
  return result.text;
};
