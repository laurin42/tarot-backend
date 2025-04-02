import { GenerateContentResult, Part } from "@google/generative-ai";

// Define interfaces that match the structure from @google/generative-ai
export interface GeminiContent {
  parts: Part[];
}

export interface GeminiCandidate {
  content: GeminiContent;
}

export interface GeminiResponse {
  response: {
    candidates?: GeminiCandidate[];
  };
}

// Add a helper function to adapt the Google AI response to our expected format
export function adaptGeminiResponse(response: GenerateContentResult): GeminiResponse {
  return {
    response: {
      candidates: response.response.candidates?.map(candidate => ({
        content: {
          parts: candidate.content.parts
        }
      }))
    }
  };
}