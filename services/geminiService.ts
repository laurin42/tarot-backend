import { GoogleGenerativeAI, GenerateContentResult } from "@google/generative-ai";
import { adaptGeminiResponse } from "../types/gemini";

// Gemini AI Client
export class GeminiService {
  private _model;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY not found in environment variables!");
      throw new Error("GEMINI_API_KEY is required");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    
    this._model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  // Gemini-Antworten verarbeiten
  public processGeminiResponse(response: GenerateContentResult): string {
    try {
      const adaptedResponse = adaptGeminiResponse(response);
      const text = adaptedResponse.response?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (typeof text === 'string') {
        return text;
      } else if (response.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.response.candidates[0].content.parts[0].text as string;
      }
      
      return "Keine Antwort erhalten";
    } catch (error) {
      console.error("Error processing Gemini response:", error);
      return "Keine Antwort erhalten";
    }
  }

  // Inhalt generieren
  public async generateContent(prompt: string): Promise<string> {
    try {
      const response = await this._model.generateContent(prompt);
      return this.processGeminiResponse(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Failed to generate content:", errorMessage, error);
      if (error && typeof error === 'object' && 'status' in error) {
         console.error(`Google API Error Status: ${error.status}`);
      }
      return "Entschuldigung, bei der Generierung der Antwort ist ein Fehler aufgetreten.";
    }
  }

  // Getter for the model
  get model() {
    return this._model;
  }
}

// LAZY INITIALIZATION:
// Store the instance here, initially null
let geminiServiceInstance: GeminiService | null = null;

// Function to get the singleton instance, creates it on first call
export function getGeminiService(): GeminiService {
  if (!geminiServiceInstance) {
    console.log("Instantiating GeminiService..."); // Log instantiation
    geminiServiceInstance = new GeminiService();
  }
  return geminiServiceInstance;
}

// REMOVE immediate instantiation and export
// export const geminiService = new GeminiService();
// export const model = geminiService.model;