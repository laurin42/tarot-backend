import { GenerateContentResult } from "@google/generative-ai";
import { adaptGeminiResponse } from "../types/gemini";

export const processGeminiResponse = (response: GenerateContentResult): string => {
  try {
    // First adapt the response to our expected format
    const adaptedResponse = adaptGeminiResponse(response);
    const text = adaptedResponse.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    // Handle text or non-text parts appropriately
    if (typeof text === 'string') {
      return text;
    } else if (response.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      // Direct access as fallback
      return response.response.candidates[0].content.parts[0].text as string;
    }
    
    return "Keine Antwort erhalten";
  } catch (error) {
    console.error("Error processing Gemini response:", error);
    return "Keine Antwort erhalten";
  }
};