import { HttpClient } from "../api/httpClient";
import { OllamaChatRequest, OllamaChatResponse, OpenIAResponse } from "../types/ollama.types";

/**
 * Servicio encargado exclusivamente de la comunicación con Ollama.
 * Sigue el Single Responsibility Principle (SRP).
 */
export class OllamaService {
  private readonly baseUrl: string;

  constructor(
    private readonly httpClient: HttpClient,
    baseUrl: string = process.env.NEXT_PUBLIC_OLLAMA_API_BASE_URL ||
      "https://model-api-chart.isaacdev.site/api",
  ) {
    this.baseUrl = baseUrl;
  }

  /**
   * Envía una solicitud de chat al modelo LLM.
   */

  async generateChatCompletion(
    request: OllamaChatRequest,
  ): Promise<OllamaChatResponse> {
    const url = `${this.baseUrl}/chat/completions`;
    const response = await this.httpClient.post<OllamaChatResponse | OpenIAResponse>(
      url,
      request,
    );

    // Adapt OpenAI format (used by llama.cpp) to Ollama format
    if ('choices' in response && response.choices && response.choices.length > 0) {
      const choice = response.choices[0];
      const message = choice.message;
      
      let tool_calls = message.tool_calls;
      if (tool_calls) {
        tool_calls = tool_calls.map((tc) => {
          if (tc.function && typeof tc.function.arguments === 'string') {
            try {
              tc.function.arguments = JSON.parse(tc.function.arguments);
            } catch (e) {
              console.error("Error parsing tool call arguments:", e);
            }
          }
          return tc;
        });
      }
      
      return {
        model: response.model || request.model,
        created_at: response.created ? new Date(response.created * 1000).toISOString() : new Date().toISOString(),
        message: {
          role: message.role,
          content: message.content,
          tool_calls: tool_calls as OllamaChatResponse["message"]["tool_calls"]
        }
      };
    }
    
    return response as OllamaChatResponse;
  }
}
