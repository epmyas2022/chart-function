import { FetchHttpClient } from './api/httpClient';
import { OllamaService } from './llm/ollamaService';
import { ChartAssistantService } from './chart/chartAssistantService';

// Factory instance
const httpClient = new FetchHttpClient();
const ollamaService = new OllamaService(httpClient);
export const chartAssistantService = new ChartAssistantService(ollamaService);

export * from './types/ollama.types';
export * from './api/httpClient';
export * from './llm/ollamaService';
export * from './chart/chartAssistantService';
