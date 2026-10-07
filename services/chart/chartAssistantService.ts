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
    const SYSTEM_PROMPT = `# Role
You are an expert chart-controlling tool assistant. Prioritize precision over creativity.
- DO NOT invent or rename fields.
- DO NOT output conversational text; call the tool directly.

# Core Process
Before calling a tool, map out: user intent, target tool, dimension, metric, aggregation, order, limit, colors, and filters. ONLY use fields from the provided \`available fields\`.

# Tool Selection
- \`create_chart\`: Use when the user asks to "create", "draw", "make" a chart, OR when the "Current chart state" is "No active chart."
- \`update_chart\`: Use ONLY when an active chart already exists AND the user asks to change, modify, update, reorder, filter, or tweak it.

# Dimension Rules
Dimensions group data into categories.
- "products" -> use the product name field.
- "categories" -> use the category field.
- "regions" -> use the region field.
- "years" -> use the year field.
NEVER use an \`id\` field as a dimension if a descriptive text field exists.`;

    let chartStateText = "No active chart.";
    if (activeChartState) {
      const state = activeChartState;
      chartStateText = [
        `- Chart type: ${state.chart_type ?? "unknown"}`,
        `- Dimension (X axis): ${state.dimension ?? "unknown"}`,
        `- Metric (Y axis): ${state.metric ?? "unknown"}`,
        state.metric_y ? `- Metric Y (scatter): ${state.metric_y}` : null,
        state.limit ? `- Limit: ${state.limit} items` : null,
        state.sort_direction ? `- Sort: ${state.sort_direction}` : null,
        state.title ? `- Title: ${state.title}` : null,
      ]
        .filter(Boolean)
        .join("\n");
    }

    const lastToolText = lastToolCall
      ? JSON.stringify(lastToolCall, null, 2)
      : "No previous tools executed.";

    // Get the actual user request from the last message
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage ? lastMessage.content : "";

    const userContent = `## Context data
The user is working with the dataset: "${datasetContext?.file || "unknown"}".
The available fields are: ${datasetContext?.fields || ""}.

## Current chart state
${chartStateText}

## Last tool executed
${lastToolText}

## User request
${userMessage}`;

    const systemPromptMsg: OllamaMessage = {
      role: "system",
      content: SYSTEM_PROMPT,
    };

    // Replace the content of the last user message with the enriched userContent
    const updatedMessages = [...messages];
    if (updatedMessages.length > 0) {
      updatedMessages[updatedMessages.length - 1] = {
        ...updatedMessages[updatedMessages.length - 1],
        content: userContent,
      };
    }

    console.log("=== ENVIANDO A OLLAMA ===");
    console.log(JSON.stringify([systemPromptMsg, ...updatedMessages], null, 2));


    const request = {
      model: this.modelName,
      stream: false,
      messages: [systemPromptMsg, ...updatedMessages],
      tools: this.getAvailableTools(),
      cache_prompt: true,
    };

    return this.ollamaService.generateChatCompletion(request);
  }
}
