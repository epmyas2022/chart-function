export interface Filter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains';
  value: unknown;
}

export interface CreateChartParams {
  chart_type: 'bar' | 'line' | 'pie' | 'scatter';
  dimension?: string;
  metric?: string;
  metric_y?: string;
  aggregation?: 'sum' | 'average' | 'count';
  sort_direction?: 'asc' | 'desc';
  limit?: number;
  colors?: string[];
  filters?: Filter[];
  title?: string;
  order?: 'asc' | 'desc';
}

export interface UpdateChartParams {
  chart_type?: 'bar' | 'line' | 'pie' | 'scatter';
  dimension?: string;
  metric?: string;
  metric_y?: string;
  aggregation?: 'sum' | 'average' | 'count';
  sort_direction?: 'asc' | 'desc';
  limit?: number;
  colors?: string[];
  show_grid?: boolean;
  title?: string;
  filters?: Filter[];
}

const _FILTER_ITEM_SCHEMA = {
  type: 'object',
  properties: {
    field: {
      type: 'string',
      description: 'Campo o dimensión por el que se filtra (ej. categoria, region, año).',
    },
    operator: {
      type: 'string',
      enum: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'contains'],
      description:
        'Operador de comparación. ' +
        'eq (igual), neq (diferente), ' +
        'gt (mayor que), gte (mayor o igual), ' +
        'lt (menor que), lte (menor o igual), ' +
        'contains (contiene, para búsqueda parcial de texto).',
    },
    value: {
      description: 'Valor de comparación. Puede ser texto, número o booleano según el campo.',
    },
  },
  required: ['field', 'operator', 'value'],
};

const _FILTERS_FIELD = {
  type: 'array',
  description:
    'Filtros sobre los datos antes de graficar. Cada filtro es un objeto ' +
    '{field, operator, value}. Se pueden combinar múltiples filtros. ' +
    "IMPORTANTE: NUNCA uses filters para extraer el límite de elementos (ej. '5 productos' o 'top 5'). El límite de elementos numérico SIEMPRE va en la propiedad limit o number_of_items. Además, NUNCA uses filters para resolver 'los menos vendidos' o 'los más vendidos' (ej. no inventes un operador 'lt' o 'gt'). Para encontrar los top/mejores/peores/más/menos, simplemente usa 'sort_direction' y 'limit'. SOLO usa filters si el usuario da un valor específico de corte (ej. 'ventas mayores a 100').",
  items: _FILTER_ITEM_SCHEMA,
};

export const CREATE_CHART = {
  name: 'create_chart',
  parameters: {
    type: 'object',
    properties: {
      chart_type: {
        type: 'string',
        enum: ['bar', 'line', 'pie', 'scatter'],
        description: "Tipo de gráfico. Obligatorio. bar (barras), line (líneas), pie (circular o pastel. NUNCA uses 'pastel', usa 'pie'), scatter (dispersión).",
      },
      dimension: {
        type: 'string',
        description: "El nombre exacto de la dimensión. No agregues sufijos como '_id'.",
      },
      metric: {
        type: 'string',
        description:
          'Métrica del eje Y (o eje principal). Para scatter, es la variable del eje X. ' +
          'Nombre exacto del campo numérico. Puede llevar guiones bajos.',
      },
      metric_y: {
        type: 'string',
        description:
          'Segunda variable cuantitativa para el eje Y. ' +
          'Obligatorio en gráficos de dispersión (scatter). ' +
          'Debe ser un campo numérico distinto a metric.',
      },
      aggregation: {
        type: 'string',
        enum: ['sum', 'average', 'count'],
        description: 'Agregación matemática. sum (suma), average (promedio), count (cantidad).',
      },
      sort_direction: {
        type: 'string',
        enum: ['asc', 'desc'],
        description: "Dirección de ordenamiento. asc (ascendente) = 'de menor a mayor', 'de menos a más', 'los menos vendidos', 'ascendente'. desc (descendente) = 'de mayor a menor', 'de más a menos', 'los más vendidos', 'descendente'. PRESTA ATENCIÓN: Si el usuario pide 'menos a más' o 'menos vendidos', SIEMPRE usa 'asc'. Si pide 'más a menos' o 'más vendidos', usa 'desc'.",
      },
      limit: {
        type: 'integer',
        description: "Número máximo de elementos a mostrar (ej. el número 5 en 'los 5 más vendidos').",
      },
      colors: {
        type: 'array',
        items: { type: 'string' },
        description: "Lista de colores EN INGLÉS para el gráfico (ej. ['red'], ['red', 'blue']). SIEMPRE traduce al inglés.",
      },
      filters: _FILTERS_FIELD,
    },
    required: ['chart_type', 'dimension', 'metric', 'aggregation'],
  },
};

export const UPDATE_CHART = {
  name: 'update_chart',
  parameters: {
    type: 'object',
    properties: {
      chart_type: {
        type: 'string',
        enum: ['bar', 'line', 'pie', 'scatter'],
        description: "Nuevo tipo de gráfico. bar (barras), line (líneas), pie (circular o pastel. NUNCA uses 'pastel', usa 'pie'), scatter (dispersión).",
      },
      dimension: {
        type: 'string',
        description: "Nueva dimensión. No agregues sufijos como '_id'.",
      },
      metric: {
        type: 'string',
        description: "Nueva métrica numérica a visualizar (por ejemplo, ingresos, venta_total, cantidad). PRESTA ATENCIÓN: Si el usuario dice 'cambia la métrica por cantidad', debes establecer 'metric' en 'cantidad', NO asumas que se refiere a la agregación 'count'.",
      },
      metric_y: {
        type: 'string',
        description:
          'Segunda métrica numérica, para el eje Y. ' +
          'OBLIGATORIO si cambias el chart_type a scatter. ' +
          'Debe ser el nombre exacto del campo numérico, distinto a metric.',
      },
      aggregation: {
        type: 'string',
        enum: ['sum', 'average', 'count'],
        description: 'Nueva agregación matemática. sum (suma), average (promedio), count (cantidad).',
      },
      sort_direction: {
        type: 'string',
        enum: ['asc', 'desc'],
        description: "Nuevo ordenamiento. asc (ascendente) = 'de menor a mayor', 'de menos a más', 'los menos vendidos', 'ascendente'. desc (descendente) = 'de mayor a menor', 'de más a menos', 'los más vendidos', 'descendente'. PRESTA ATENCIÓN: Si el usuario pide 'menos a más' o 'menos vendidos', SIEMPRE usa 'asc'. Si pide 'más a menos' o 'más vendidos', usa 'desc'.",
      },
      limit: {
        type: 'integer',
        description: "Nuevo límite de elementos a mostrar (ej. el número 4 en 'solo 4 productos' o 'los 4 más vendidos').",
      },
      colors: {
        type: 'array',
        items: { type: 'string' },
        description: 'Nueva lista de colores EN INGLÉS para el gráfico. SIEMPRE traduce al inglés.',
      },
      show_grid: {
        type: 'boolean',
        description: 'Si se debe mostrar la cuadrícula.',
      },
      title: {
        type: 'string',
        description: 'Nuevo título del gráfico.',
      },
      filters: _FILTERS_FIELD,
    },
  },
};
