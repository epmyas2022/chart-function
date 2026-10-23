"use client";

import { useEffect, useRef, useState } from 'react';
import { ChatMessage } from './Dashboard';

interface ChatAreaProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
  onViewChart?: () => void;
}

export default function ChatArea({ messages, onSendMessage, isLoading, onViewChart }: ChatAreaProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

/*   useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
 */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="w-full h-dvh flex flex-col bg-white md:border-r border-zinc-200 shadow-sm z-10 ">
      <div className="p-4 sm:p-5 border-b border-zinc-100 hidden md:flex items-center shrink-0">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm mr-3">
          AI
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-800 leading-tight">Data Assistant</h2>
          <p className="text-xs text-zinc-400">Pregunta y genera visualizaciones</p>
        </div>
      </div>
      
      <div className="h-[calc(100%-135px)] overflow-y-auto p-3.5 sm:p-5 space-y-4 sm:space-y-6 bg-zinc-50/50 flex flex-col min-h-0">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-zinc-500 text-xs sm:text-sm my-auto p-4 sm:p-6 bg-white/70 rounded-xl border border-dashed border-zinc-200">
            <p className="font-medium text-zinc-700 mb-1">¡Hola! ¿Qué deseas visualizar?</p>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-xs mx-auto">
              Pregúntame para crear o modificar gráficos. Por ejemplo:
            </p>
            <p className="mt-2 text-blue-600 font-mono text-[11px] sm:text-xs bg-blue-50/70 p-2 rounded-lg border border-blue-100/60 inline-block">
              &quot;Crea una gráfica de barras con los 5 productos usando la metrica precio de venta&quot;
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start items-end gap-2'}`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold shrink-0 mb-1">
                AI
              </div>
            )}
            
            <div className="flex flex-col gap-1 max-w-[90%] sm:max-w-[85%]">
              {msg.content && (
                <div className={`rounded-2xl py-2.5 px-3.5 sm:px-4 text-sm leading-relaxed shadow-xs ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                    : 'bg-white border border-zinc-200 text-zinc-700 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              )}

              {/* Mobile shortcut to view chart if chart tool was executed */}
              {onViewChart && msg.role === 'assistant' && msg.toolCalls?.some(tc => ['create_chart', 'update_chart'].includes(tc.name)) && (
                <button
                  type="button"
                  onClick={onViewChart}
                  className="md:hidden mt-1.5 self-start inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-medium rounded-lg transition-all active:scale-95 shadow-xs"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 20V10M12 20V4M6 20v-6" />
                  </svg>
                  <span>Ver gráfico generado →</span>
                </button>
              )}
              
              {/* Render tool calls */}
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <details className="mt-1 rounded-lg border border-zinc-200 bg-zinc-100 text-xs font-mono overflow-hidden">
                  <summary className="cursor-pointer select-none px-3 py-2 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors list-none flex items-center gap-1.5">
                    <svg className="w-3 h-3 details-chevron transition-transform shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span>⚙️ {msg.toolCalls.length} tool call{msg.toolCalls.length > 1 ? 's' : ''}</span>
                  </summary>
                  <div className="px-3 pb-3 pt-1 border-t border-zinc-200 text-zinc-600 max-h-48 overflow-y-auto">
                    {msg.toolCalls.map((tc, idx) => (
                      <div key={idx} className="mb-2 last:mb-0">
                        <span className="font-bold text-blue-600 break-all">{tc.name}</span>
                        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-all text-[11px] bg-white/70 p-1.5 rounded border border-zinc-200/50">
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

        {/* <div ref={bottomRef} /> */}
      </div>

      <div className="p-3 sm:p-4 bg-white border-t border-zinc-100 pb-[max(0.75rem,env(safe-area-inset-bottom))] shrink-0">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta sobre tus datos..." 
            disabled={isLoading}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-full pl-4 pr-12 py-2.5 sm:py-3 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-zinc-800 transition-all placeholder:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-label="Enviar mensaje"
            className="absolute right-1.5 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full transition-all active:scale-95 shadow-xs"
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
