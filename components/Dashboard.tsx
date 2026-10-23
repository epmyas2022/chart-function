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
  const [activeMobileTab, setActiveMobileTab] = useState<'chat' | 'chart'>('chat');
  const [hasNewChartNotice, setHasNewChartNotice] = useState(false);

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
              setHasNewChartNotice(true);
            } else if (tc.name === 'update_chart') {
              setChartUpdates(prev => ({ ...prev, ...(tc.arguments as UpdateChartParams) }));
              setHasNewChartNotice(true);
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
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-zinc-50 overflow-hidden font-sans">
      {/* Mobile Top Navigation */}
      <header className="md:hidden flex items-center justify-between px-4 py-2.5 bg-white border-b border-zinc-200 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            AI
          </div>
          <span className="font-semibold text-sm text-zinc-800 tracking-tight">Data Assistant</span>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveMobileTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeMobileTab === 'chat'
                ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Chat</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMobileTab('chart');
              setHasNewChartNotice(false);
            }}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeMobileTab === 'chart'
                ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
            <span>Gráfico</span>
            {hasNewChartNotice && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Chat Area container */}
      <section
        className={`w-full md:w-80 lg:w-96 shrink-0 h-full flex flex-col min-w-0 ${
          activeMobileTab === 'chat' ? 'flex' : 'hidden md:flex'
        }`}
        aria-label="Área de chat"
      >
        <ChatArea
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onViewChart={() => {
            setActiveMobileTab('chart');
            setHasNewChartNotice(false);
          }}
        />
      </section>

      {/* Chart Area container */}
      <main
        className={`flex-1 min-w-0 h-full flex flex-col ${
          activeMobileTab === 'chart' ? 'flex' : 'hidden md:flex'
        }`}
      >
        <ChartArea
          config={chartConfig}
          updates={chartUpdates}
          isLoading={isLoading}
          allDatasets={allDatasets}
          selectedDataset={selectedDataset}
          onDatasetChange={setSelectedDataset}
          onAddDataset={(key, dataset) => setAllDatasets(prev => ({ ...prev, [key]: dataset }))}
          onBackToChat={() => setActiveMobileTab('chat')}
        />
      </main>
    </div>
  );
}
