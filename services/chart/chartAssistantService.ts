import { OllamaService } from "../llm/ollamaService";
import {
  OllamaFunctionParameter,
  OllamaMessage,
  OllamaTool,
} from "../types/ollama.types";
import { CREATE_CHART, UPDATE_CHART } from "@/types/chart";
import { DATASETS, MockDataset } from "@/data/mockData";

/**
 * Servicio encargado de orquestar el asistente de gráficos.
 * Construye el contexto (herramientas y mensajes) y delega a OllamaService.
 */
export class ChartAssistantService {
  private readonly modelName = "chart-model";

  constructor(private readonly ollamaService: OllamaService) {}

  /**
   * Adapta las interfaces locales a la estructura de herramientas esperada por Ollama.
   */
  private getAvailableTools(): OllamaTool[] {
    return [
      {
        type: "function",
        function: {
          name: CREATE_CHART.name,
          description:
            "Crea un nuevo gráfico a partir de los datos. Úsalo SOLO si el usuario pide explícitamente crear, dibujar o hacer un gráfico desde cero, o si no hay un gráfico previo.",
          parameters: CREATE_CHART.parameters as OllamaFunctionParameter,
        },
      },
      {
        type: "function",
        function: {
          name: UPDATE_CHART.name,
          description:
            "Actualiza o cambia propiedades del gráfico actualmente mostrado. Úsalo SIEMPRE que el usuario pida 'cambiar', 'modificar', 'actualizar', 'reordenar', 'filtrar' o ajustar un gráfico que ya existe.",
          parameters: UPDATE_CHART.parameters as OllamaFunctionParameter,
        },
      },
    ];
  }

  /**
   * Processes a user message and returns the LLM response
   * including any possible tool_calls.
   */
  async processUserMessage(
    messages: OllamaMessage[],
    lastToolCall?: { name: string; arguments: Record<string, unknown> } | null,
    activeChartState?: Record<string, unknown> | null,
    datasetContext?: { file: string; fields: string } | null,
  ) {
    let systemContent = `
    # Rol
    You are a graphical tool call assistant. Created by developer isaacdev.site."
          
    ## Context data
    The user is working with the dataset: "${datasetContext?.file || 'unknown'}".
    The available fields are: ${datasetContext?.fields || ''}.`;

    if (activeChartState) {
      const state = activeChartState;
      const lines = [
        `- Chart type: ${state.chart_type ?? "unknown"}`,
        `- Dimension (X axis): ${state.dimension ?? "unknown"}`,
        `- Metric (Y axis): ${state.metric ?? "unknown"}`,
        state.metric_y   ? `- Metric Y (scatter): ${state.metric_y}` : null,
        state.limit      ? `- Limit: ${state.limit} items` : null,
        state.sort_direction ? `- Sort: ${state.sort_direction}` : null,
        state.title      ? `- Title: ${state.title}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      systemContent += `\n\n## Current chart state (what the user is seeing right now)\n${lines}`;
    }

    if (lastToolCall) {
      systemContent += `\n\n## Last tool executed\n${JSON.stringify(lastToolCall, null, 2)}`;
    }

    const systemPrompt: OllamaMessage = {
      role: "system",
      content: systemContent,
    };

    console.log("=== ENVIANDO A OLLAMA ===");
    console.log(JSON.stringify([systemPrompt, ...messages], null, 2));

    const request = {
      model: this.modelName,
      stream: false,
      messages: [systemPrompt, ...messages],
      tools: this.getAvailableTools(),
    };

    return this.ollamaService.generateChatCompletion(request);
  }
}
