export interface OllamaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_calls?: OllamaToolCall[];
}

export interface OllamaToolCall {
  id: string;
  function: {
    index?: number;
    name: string;
    arguments: Record<string, unknown>;
  };
}

export interface OllamaFunctionParameter {
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
}

export interface OllamaTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: OllamaFunctionParameter;
  };
}

export interface OllamaChatRequest {
  model: string;
  stream: boolean;
  messages: OllamaMessage[];
  tools?: OllamaTool[];
}

export interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: OllamaMessage;
}


export interface OpenIAResponse {
  choices: Array<{
    message: {
      role: 'user' | 'assistant' | 'system';
      content: string;
      tool_calls?: Array<{
        id: string;
        type: 'function';
        function: {
          name: string;
          arguments: string | Record<string, unknown>;
        };
      }>;
    };
  }>;
  created?: number;
  model?: string;
}
