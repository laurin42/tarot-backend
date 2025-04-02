import { GoogleGenerativeAI, GenerateContentResult } from "@google/generative-ai";
import { adaptGeminiResponse } from "../types/gemini";

// Gemini AI Client
export class GeminiService {
  private _model;

  constructor() {
    const genAI = new GoogleGenerativeAI(process.env.API_KEY || "") || (() => {
      console.error("API_KEY not found in environment");
      console.log(process.env.API_KEY);
      throw new Error("API_KEY is required");
    })()
    
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
      console.error("Failed to generate content:", error);
      return "Keine Antwort erhalten";
    }
  }

  // Getter for the model
  get model() {
    return this._model;
  }
}

// Exportiere eine Singleton-Instanz
export const geminiService = new GeminiService();

// Exportiere auch das model direkt für bestehende Imports
export const model = geminiService.model;