import { GoogleGenAI, Type } from "@google/genai";
import { Book } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Uses Gemini to generate a list of books based on a natural language query.
 * This powers the "Smart Search" / "Ask the Librarian" feature.
 */
export const getBookRecommendations = async (query: string): Promise<Book[]> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
      model,
      contents: `Recommend 4 distinct books based on this request: "${query}". 
      If the request is vague, provide a diverse mix of high-quality literature.
      Return valid JSON only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              author: { type: Type.STRING },
              description: { type: Type.STRING },
              price: { type: Type.NUMBER },
              genre: { type: Type.STRING },
            },
            required: ["title", "author", "description", "price", "genre"],
          },
        },
      },
    });

    const rawText = response.text || "[]";
    
    // Robust parsing: extract JSON array substring to handle potential extra text
    const start = rawText.indexOf('[');
    const end = rawText.lastIndexOf(']');
    
    if (start === -1 || end === -1) {
        return [];
    }

    const cleanText = rawText.substring(start, end + 1);
    const data = JSON.parse(cleanText);

    // Augment with frontend-specific IDs and image seeds
    return data.map((item: any, index: number) => ({
      ...item,
      id: `ai-${Date.now()}-${index}`,
      coverSeed: Math.floor(Math.random() * 1000) + index, // Deterministic-ish seed
      isAIRecommended: true,
    }));

  } catch (error) {
    console.error("Gemini Recommendation Error:", error);
    return [];
  }
};

/**
 * A general chat for the "Ask a Librarian" modal, distinct from the search results.
 */
export const chatWithLibrarian = async (history: {role: string, parts: {text: string}[]}[], message: string): Promise<string> => {
    try {
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: history,
            config: {
                systemInstruction: "You are the knowledgeable, warm, and slightly witty head librarian of 'Whose Books', an independent bookstore. You love helping people find their next great read. Keep answers concise (under 100 words) unless asked for a deep dive.",
            }
        });

        const result = await chat.sendMessage({ message });
        return result.text || "I'm having a little trouble finding that in the stacks right now.";
    } catch (e) {
        console.error("Chat error", e);
        return "I'm sorry, I seem to have lost my train of thought. Could you ask that again?";
    }
}