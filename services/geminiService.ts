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
    
    // Robust parsing: Find the first '[' that is followed by a '{' (allowing for whitespace)
    // This avoids matching brackets in conversational text like "Here is a list [of books]:"
    const jsonArrayMatch = rawText.match(/\[\s*\{/);
    
    let cleanText = "[]";
    
    if (jsonArrayMatch && jsonArrayMatch.index !== undefined) {
        const start = jsonArrayMatch.index;
        const end = rawText.lastIndexOf(']');
        if (end > start) {
            cleanText = rawText.substring(start, end + 1);
        }
    } else if (rawText.trim().startsWith('[')) {
        // Fallback for simple arrays or empty arrays
        const end = rawText.lastIndexOf(']');
        if (end !== -1) {
            cleanText = rawText.substring(0, end + 1);
        }
    }

    let data: any[] = [];
    try {
        data = JSON.parse(cleanText);
    } catch (parseError) {
        console.error("JSON Parse failed:", parseError, "Raw:", rawText);
        return [];
    }

    if (!Array.isArray(data)) {
        return [];
    }

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