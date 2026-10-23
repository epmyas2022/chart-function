import { OllamaService } from "../llm/ollamaService";
import {
  OllamaFunctionParameter,
  OllamaMessage,
  OllamaTool,
} from "../types/ollama.types";
import { CREATE_CHART, UPDATE_CHART } from "@/types/chart";

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
    const SYSTEM_PROMPT = `
    You are a chart-control assistant fine-tuned to use two tools: **create_chart** and **update_chart**.
## General Rules
- Prioritize precision over creativity.
- Never invent, rename, or assume fields or parameters.
- Use only fields listed in available fields.
- Include only parameters explicitly requested by the user or required by the tool schema.
- Do not output conversational text; call the appropriate tool directly.

## Tool Selection
- **create_chart**: Use when the user requests a new chart or when **Current chart state** is **No active chart** and the request requires creating one.
- **update_chart**: Use only when an active chart exists and the user requests a modification to it.
- Never use **update_chart** when no chart is active.

## Parameter Handling
Before calling a tool, identify the user's intent and map the request to the relevant tool parameters, including dimension, metric, aggregation, ordering, limit, colors, and filters.
- Include a parameter only when explicitly requested or required by the tool schema.
- Never infer unspecified optional parameters.
- Preserve the user's intent without adding extra requirements.
    `;

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
