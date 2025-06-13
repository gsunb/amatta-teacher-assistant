// Google Gemini API integration utilities
// This file provides functions to interact with the Gemini API for natural language processing

export interface GeminiResponse {
  processed: boolean;
  message: string;
  data?: any;
}

export async function processNaturalLanguageCommand(command: string): Promise<GeminiResponse> {
  const apiKey = localStorage.getItem("gemini_api_key");
  
  if (!apiKey) {
    throw new Error("Gemini API 키가 설정되지 않았습니다. 설정에서 API 키를 입력해주세요.");
  }

  try {
    // This would integrate with the actual Google Gemini API
    // For now, we'll use the backend endpoint which will handle the Gemini integration
    const response = await fetch("/api/process-command", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ command }),
    });

    if (!response.ok) {
      throw new Error("명령 처리에 실패했습니다.");
    }

    return await response.json();
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

export function validateApiKey(apiKey: string): boolean {
  // Basic validation for Gemini API key format
  return apiKey.length > 20 && apiKey.startsWith("AIza");
}

export function getStoredApiKey(): string | null {
  return localStorage.getItem("gemini_api_key");
}

export function storeApiKey(apiKey: string): void {
  localStorage.setItem("gemini_api_key", apiKey);
}

export function removeApiKey(): void {
  localStorage.removeItem("gemini_api_key");
}
