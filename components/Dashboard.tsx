"use client";

import { useState } from 'react';
import ChatArea from './ChatArea';
import ChartArea from './ChartArea';
import { CreateChartParams, UpdateChartParams } from '@/types/chart';
import { DATASETS, MockDataset } from '@/data/mockData';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: Array<{
    name: string;
    arguments: Record<string, unknown>;
  }>;
}

export default function Dashboard() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chartConfig, setChartConfig] = useState<CreateChartParams | null>(null);
  const [chartUpdates, setChartUpdates] = useState<UpdateChartParams | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [allDatasets, setAllDatasets] = useState<Record<string, { label: string, file: string, data: any[] }>>(DATASETS);
  const [selectedDataset, setSelectedDataset] = useState<string>('productos');

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };
    
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    try {
      setIsLoading(true);
      const lastToolCall = messages
        .filter(m => m.role === 'assistant' && m.toolCalls && m.toolCalls.length > 0)
        .at(-1)?.toolCalls?.[0] ?? null;

      const activeChartState = chartConfig
        ? {
            chart_type: chartUpdates?.chart_type ?? chartConfig.chart_type,
            dimension:  chartUpdates?.dimension  ?? chartConfig.dimension,
            metric:     chartUpdates?.metric     ?? chartConfig.metric,
            metric_y:   chartUpdates?.metric_y   ?? chartConfig.metric_y,
            limit:      chartUpdates?.limit      ?? chartConfig.limit,
            sort_direction: chartUpdates?.sort_direction ?? chartConfig.sort_direction,
            title:      chartUpdates?.title      ?? chartConfig.title,
          }
        : null;

      const currentDataset = allDatasets[selectedDataset];
      const firstRow = currentDataset?.data[0] as Record<string, unknown> | undefined;
      const availableFields = firstRow ? Object.keys(firstRow).join(", ") : "";

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: text }],
          lastToolCall,
          activeChartState,
          datasetContext: {
            file: currentDataset?.file || 'unknown',
            fields: availableFields
          },
        }),
      });
      
      const data = await response.json();
      
      if (data.message) {
        const toolCalls = data.message.tool_calls?.map((tc: { function: { name: string; arguments: unknown } }) => ({
          name: tc.function.name,
          arguments: tc.function.arguments,
        }));

        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message.content || 'Con gusto, he procesado tu solicitud 😊',
          toolCalls,
        };
        
        setMessages(prev => [...prev, assistantMsg]);

        if (toolCalls && toolCalls.length > 0) {
          for (const tc of toolCalls) {
            if (tc.name === 'create_chart') {
              setChartConfig(tc.arguments as CreateChartParams);
              setChartUpdates(null);
            } else if (tc.name === 'update_chart') {
              setChartUpdates(prev => ({ ...prev, ...(tc.arguments as UpdateChartParams) }));
            }
          }
        }
      }
    } catch (error) {
      console.error('Error calling chat API:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Hubo un error al procesar tu solicitud.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-zinc-50 overflow-hidden font-sans">
      <ChatArea messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
      <ChartArea
        config={chartConfig}
        updates={chartUpdates}
        isLoading={isLoading}
        allDatasets={allDatasets}
        selectedDataset={selectedDataset}
        onDatasetChange={setSelectedDataset}
        onAddDataset={(key, dataset) => setAllDatasets(prev => ({ ...prev, [key]: dataset }))}
      />
    </div>
  );
}
