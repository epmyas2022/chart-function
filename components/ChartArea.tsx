"use client";

import { useMemo, useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import { CreateChartParams, UpdateChartParams } from '@/types/chart';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartAreaProps {
  config: CreateChartParams | null;
  updates: UpdateChartParams | null;
  isLoading: boolean;
  allDatasets: Record<string, { label: string, file: string, data: any[] }>;
  selectedDataset: string;
  onDatasetChange: (dataset: string) => void;
  onAddDataset: (key: string, dataset: { label: string, file: string, data: any[] }) => void;
}

function SkeletonBlock({
  width,
  height,
  delay,
  radius = '6px',
}: {
  width: string;
  height: string;
  delay: number;
  radius?: string;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
        animation: `block-in 0.4s ${delay}ms both`,
      }}
    >
      {/* diagonal construction stripes */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.18,
          backgroundImage:
            'repeating-linear-gradient(45deg, #94a3b8 0px, #94a3b8 2px, transparent 2px, transparent 10px)',
        }}
      />
      {/* shimmer sweep */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
          animation: `shimmer-sweep 1.6s ${delay}ms ease-in-out infinite`,
        }}
      />
    </div>
  );
}

export default function ChartArea({ config, updates, isLoading, allDatasets, selectedDataset, onDatasetChange, onAddDataset }: ChartAreaProps) {
  const [activeTab, setActiveTab] = useState<'chart' | 'table'>('chart');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeData = allDatasets[selectedDataset]?.data as Record<string, unknown>[] || [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (data.length > 0) {
          const newKey = file.name.replace(/\.[^/.]+$/, "").toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
          onAddDataset(newKey, {
            label: file.name,
            file: file.name,
            data: data
          });
          onDatasetChange(newKey);
        }
      } catch (err) {
        console.error("Error parsing file:", err);
        alert("Hubo un error al leer el archivo. Asegúrate de que es un archivo excel o csv válido.");
      }
    };
    reader.readAsBinaryString(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const chartData = useMemo(() => {
    if (!config) return null;

    const activeData = allDatasets[selectedDataset]?.data as Record<string, unknown>[] || [];
    let data = [...activeData];
    
    // Sort
    const sortDir = (updates?.sort_direction || config?.sort_direction) || 'desc';
    const metric = (updates?.metric || config?.metric) as string;
    
    data.sort((a, b) => {
      const valA = Number(a[metric]) || 0;
      const valB = Number(b[metric]) || 0;
      return sortDir === 'asc' ? valA - valB : valB - valA;
    });

    // Limit
    const limit = (updates?.limit || config?.limit) || data.length;
    data = data.slice(0, limit);

    const firstKey = Object.keys(activeData[0] ?? {})[1] ?? 'id';
    const dimensionKey = updates?.dimension || config.dimension || firstKey;
    const labels = data.map(item => item[dimensionKey] as string);
    const type = updates?.chart_type || config.chart_type;
    const userColors = updates?.colors?.length ? updates.colors : (config.colors?.length ? config.colors : ['#2563eb']);
    
    let datasets: any[] = [];

    if (type === 'scatter') {
      const metricY = (updates?.metric_y || config.metric_y) as string;
      const scatterValues = data.map(item => ({
        x: Number(item[metric]) || 0,
        y: Number(item[metricY]) || 0
      }));
      const backgroundColors = scatterValues.map((_, i) => userColors[i % userColors.length]);
      
      datasets = [
        {
          label: `${String(metric)} vs ${String(metricY)}`,
          data: scatterValues,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors,
          pointRadius: 6,
          pointHoverRadius: 8
        }
      ];
    } else {
      const values = data.map(item => Number(item[metric]) || 0);
      const backgroundColors = values.map((_, i) => userColors[i % userColors.length]);

      datasets = [
        {
          label: updates?.metric || config?.metric,
          data: values,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors,
          borderRadius: type === 'bar' ? 4 : 0,
        }
      ];
    }

    return { labels, datasets };
  }, [config, updates, selectedDataset]);

  const chartOptions = useMemo(() => {
    const showGrid = updates?.show_grid ?? true;
    const dimensionKey = updates?.dimension || config?.dimension || 'productos';
    const title = (updates?.title || config?.title) || (config ? `${config.metric} by ${dimensionKey}` : 'Dashboard');

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: { color: '#71717a' }
        },
        title: {
          display: true,
          text: title,
          color: '#3f3f46',
          font: { size: 16 }
        },
      },
      scales: {
        y: {
          grid: {
            display: showGrid,
            color: '#f4f4f5'
          },
          ticks: { color: '#71717a' }
        },
        x: {
          grid: {
            display: false
          },
          ticks: { color: '#71717a' }
        }
      }
    };
  }, [config, updates]);

  const renderChart = () => {
    if (!config || !chartData) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
          <svg className="w-16 h-16 mb-4 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>El gráfico aparecerá aquí cuando se procese tu solicitud.</p>
        </div>
      );
    }

    const type = updates?.chart_type || config.chart_type;
    const wrap = (el: React.ReactElement) => (
      <div style={{ width: '100%', height: '100%' }}>{el}</div>
    );

    switch (type) {
      case 'line':
        return wrap(<Line options={chartOptions} data={chartData} />);
      case 'pie':
        return wrap(<Pie options={{ ...chartOptions, scales: {} }} data={chartData} />);
      case 'scatter':
        return wrap(<Scatter options={chartOptions} data={chartData} />);
      case 'bar':
      default:
        return wrap(<Bar options={chartOptions} data={chartData} />);
    }
  };

  return (
    <div className="flex-1 p-8 bg-zinc-50 flex flex-col items-center h-screen">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-sm border border-zinc-100 flex flex-col h-[700px]">
        {/* Header con Tabs y Select */}
        <div className="flex flex-col border-b border-zinc-100">
          <div className="p-6 pb-0 flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-zinc-800">Visualización de Datos</h3>
              <p className="text-sm text-zinc-500">Resultados procesados en tiempo real</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <label htmlFor="source-select" className="sr-only">Fuente</label>
                <select
                  id="source-select"
                  value={selectedDataset}
                  onChange={e => onDatasetChange(e.target.value)}
                  className="appearance-none bg-zinc-50 border border-zinc-200 text-zinc-700 py-2 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium cursor-pointer shadow-sm hover:bg-zinc-100"
                >
                  {Object.keys(allDatasets).map(key => (
                    <option key={key} value={key}>
                      {allDatasets[key].file}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".xlsx, .xls, .csv" 
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center w-9 h-9 bg-zinc-50 border border-zinc-200 text-zinc-600 rounded-lg hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                title="Cargar archivo externo (.xlsx, .csv)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex px-6 mt-6 gap-6">
            <button 
              onClick={() => setActiveTab('chart')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'chart' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
              }`}
            >
              Gráfico
            </button>
            <button 
              onClick={() => setActiveTab('table')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'table' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
              }`}
            >
              Tabla de Datos
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 p-6 flex flex-col overflow-hidden">
          {isLoading ? (
            <div className="flex-1 w-full flex flex-col gap-3 p-2">

              {/* Block: title area */}
              <SkeletonBlock width="45%" height="14px" delay={0} />
              <SkeletonBlock width="28%" height="10px" delay={80} />

              {/* Block: main content area */}
              <SkeletonBlock width="100%" height="220px" delay={160} radius="12px" />

              {/* Block: two side-by-side strips */}
              <div className="flex gap-3">
                <SkeletonBlock width="50%" height="60px" delay={240} radius="8px" />
                <SkeletonBlock width="50%" height="60px" delay={320} radius="8px" />
              </div>

              {/* Block: three narrow label strips */}
              <div className="flex gap-3">
                <SkeletonBlock width="30%" height="10px" delay={400} />
                <SkeletonBlock width="40%" height="10px" delay={460} />
                <SkeletonBlock width="20%" height="10px" delay={520} />
              </div>

              {/* Progress bar */}
              <div className="mt-auto pt-2 w-full">
                <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full"
                    style={{ animation: 'progress-bar 2s ease-in-out infinite' }}
                  />
                </div>
              </div>

              {/* Messages */}
              <div className="flex flex-col items-center gap-1 py-1">
                <p className="text-sm font-semibold text-zinc-700">
                  Construyendo Gráfico... Espere
                </p>
                <p className="text-xs text-zinc-400 text-center max-w-xs leading-relaxed">
                  Debido a los recursos del servidor esta acción puede tardar unos segundos
                </p>
              </div>

              <style>{`
                @keyframes shimmer-sweep {
                  0%   { transform: translateX(-100%); }
                  100% { transform: translateX(200%); }
                }
                @keyframes block-in {
                  from { opacity: 0; transform: scaleX(0.85); }
                  to   { opacity: 1; transform: scaleX(1); }
                }
                @keyframes progress-bar {
                  0%   { width: 0%;  margin-left: 0; }
                  50%  { width: 60%; margin-left: 20%; }
                  100% { width: 0%;  margin-left: 100%; }
                }
              `}</style>
            </div>
          ) : activeTab === 'chart' ? (
            <div className="flex-1 min-h-0 w-full relative">
              {renderChart()}
            </div>
          ) : (
            <div className="flex-1 overflow-auto rounded-lg border border-zinc-100">
              {activeData.length > 0 ? (
                <table className="w-full text-sm text-left text-zinc-600">
                  <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-200 sticky top-0">
                    <tr>
                      {Object.keys(activeData[0]).map(col => (
                        <th key={col} scope="col" className="px-4 py-3 font-medium whitespace-nowrap">
                          {col.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeData.map((row, i) => (
                      <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-4 py-3 whitespace-nowrap">
                            {String(val ?? '—')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="p-6 text-sm text-zinc-400">No hay datos disponibles.</p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
