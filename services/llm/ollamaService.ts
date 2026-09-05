import { HttpClient } from "../api/httpClient";
import { OllamaChatRequest, OllamaChatResponse } from "../types/ollama.types";

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
    const url = `${this.baseUrl}/chat`;
    const openaiResponse = await this.httpClient.post<OllamaChatResponse>(
      url,
      request,
    );
    return openaiResponse;
  }
}
