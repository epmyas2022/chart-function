"use client";

import { useEffect, useRef, useState } from 'react';
import { ChatMessage } from './Dashboard';

interface ChatAreaProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
}

export default function ChatArea({ messages, onSendMessage, isLoading }: ChatAreaProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="w-full max-w-sm h-screen flex flex-col bg-white border-r border-zinc-200 shadow-sm z-10">
      <div className="p-5 border-b border-zinc-100 flex items-center">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm mr-3">
          AI
        </div>
        <h2 className="text-base font-semibold text-zinc-800">Data Assistant</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-zinc-50/50 flex flex-col">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-zinc-500 text-sm mt-10">
            Pregúntame para generar un gráfico. Ejemplo: `Crea una gráfica de barras color rojo con los 5 productos más vendidos.`
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start items-end gap-2'}`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold shrink-0 mb-1">
                AI
              </div>
            )}
            
            <div className="flex flex-col gap-1 max-w-[85%]">
              {msg.content && (
                <div className={`rounded-2xl py-2.5 px-4 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                    : 'bg-white border border-zinc-200 text-zinc-700 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              )}
              
              {/* Render tool calls */}
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <details className="mt-1 rounded-lg border border-zinc-200 bg-zinc-100 text-xs font-mono overflow-hidden">
                  <summary className="cursor-pointer select-none px-3 py-2 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors list-none flex items-center gap-1.5">
                    <svg className="w-3 h-3 details-chevron transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span>⚙️ {msg.toolCalls.length} tool call{msg.toolCalls.length > 1 ? 's' : ''}</span>
                  </summary>
                  <div className="px-3 pb-3 pt-1 border-t border-zinc-200 text-zinc-600">
                    {msg.toolCalls.map((tc, idx) => (
                      <div key={idx} className="mb-2 last:mb-0">
                        <span className="font-bold text-blue-600">{tc.name}</span>
                        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(tc.arguments, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        ))}

        {/* Skeleton typing indicator */}
        {isLoading && (
          <div className="flex justify-start items-end gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold shrink-0 mb-1">
              AI
            </div>
            <div className="bg-white border border-zinc-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-300 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-zinc-300 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-zinc-300 animate-bounce" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-white border-t border-zinc-100">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your data..." 
            disabled={isLoading}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-full pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-zinc-800 transition-all placeholder:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-1.5 w-8 h-8 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
