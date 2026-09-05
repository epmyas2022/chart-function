export const mockProducts = [
  { id: 1, productos: 'Laptop Pro',           precio_venta: 1500, cantidad: 10, categoria: 'Laptops',      ventas_total: 15000, margen: 35 },
  { id: 2, productos: 'Smartphone X',         precio_venta: 900,  cantidad: 20, categoria: 'Smartphones',  ventas_total: 18000, margen: 28 },
  { id: 3, productos: 'Monitor 4K',           precio_venta: 400,  cantidad: 5,  categoria: 'Peripherals',  ventas_total: 2000,  margen: 22 },
  { id: 4, productos: 'Teclado Mecánico',     precio_venta: 120,  cantidad: 15, categoria: 'Peripherals',  ventas_total: 1800,  margen: 40 },
  { id: 5, productos: 'Mouse Inalámbrico',    precio_venta: 80,   cantidad: 25, categoria: 'Peripherals',  ventas_total: 2000,  margen: 45 },
  { id: 6, productos: 'Tablet Mini',          precio_venta: 350,  cantidad: 8,  categoria: 'Tablets',      ventas_total: 2800,  margen: 30 },
  { id: 7, productos: 'Smartwatch V2',        precio_venta: 250,  cantidad: 12, categoria: 'Wearables',    ventas_total: 3000,  margen: 38 },
  { id: 8, productos: 'Auriculares Bluetooth',precio_venta: 300,  cantidad: 18, categoria: 'Audio',        ventas_total: 5400,  margen: 33 },
  { id: 9, productos: 'Webcam HD',            precio_venta: 90,   cantidad: 30, categoria: 'Peripherals',  ventas_total: 2700,  margen: 42 },
  { id: 10,productos: 'Impresora Laser',      precio_venta: 220,  cantidad: 7,  categoria: 'Office',       ventas_total: 1540,  margen: 18 },
];

export const mockVentasRegionales = [
  { id: 1, region: 'Norte',     ciudad: 'Monterrey', ventas: 320000, pedidos: 1420, devolucion: 34, crecimiento: 12.5, trimestre: 'Q1' },
  { id: 2, region: 'Centro',    ciudad: 'CDMX',      ventas: 580000, pedidos: 2800, devolucion: 61, crecimiento: 8.2,  trimestre: 'Q1' },
  { id: 3, region: 'Sur',       ciudad: 'Oaxaca',    ventas: 140000, pedidos: 720,  devolucion: 18, crecimiento: 21.3, trimestre: 'Q1' },
  { id: 4, region: 'Occidente', ciudad: 'Guadalajara',ventas: 410000, pedidos: 1980, devolucion: 45, crecimiento: 15.1, trimestre: 'Q1' },
  { id: 5, region: 'Norte',     ciudad: 'Chihuahua', ventas: 195000, pedidos: 890,  devolucion: 22, crecimiento: 9.7,  trimestre: 'Q2' },
  { id: 6, region: 'Centro',    ciudad: 'Puebla',    ventas: 270000, pedidos: 1300, devolucion: 29, crecimiento: 11.0, trimestre: 'Q2' },
  { id: 7, region: 'Sur',       ciudad: 'Mérida',    ventas: 210000, pedidos: 960,  devolucion: 15, crecimiento: 18.4, trimestre: 'Q2' },
  { id: 8, region: 'Occidente', ciudad: 'León',      ventas: 365000, pedidos: 1700, devolucion: 38, crecimiento: 13.6, trimestre: 'Q2' },
  { id: 9, region: 'Norte',     ciudad: 'Tijuana',   ventas: 290000, pedidos: 1350, devolucion: 27, crecimiento: 7.5,  trimestre: 'Q3' },
  { id: 10,region: 'Centro',    ciudad: 'Toluca',    ventas: 185000, pedidos: 840,  devolucion: 20, crecimiento: 6.1,  trimestre: 'Q3' },
];

export const mockEmpleados = [
  { id: 1, nombre: 'Ana García',      departamento: 'Ventas',     salario: 28000, antiguedad: 5,  desempeño: 92, horas_extra: 12, ausencias: 2 },
  { id: 2, nombre: 'Carlos Ruiz',     departamento: 'TI',         salario: 42000, antiguedad: 8,  desempeño: 88, horas_extra: 20, ausencias: 1 },
  { id: 3, nombre: 'María López',     departamento: 'Marketing',  salario: 31000, antiguedad: 3,  desempeño: 95, horas_extra: 6,  ausencias: 0 },
  { id: 4, nombre: 'Juan Martínez',   departamento: 'Finanzas',   salario: 38000, antiguedad: 10, desempeño: 79, horas_extra: 4,  ausencias: 5 },
  { id: 5, nombre: 'Sofía Torres',    departamento: 'TI',         salario: 45000, antiguedad: 6,  desempeño: 97, horas_extra: 30, ausencias: 0 },
  { id: 6, nombre: 'Diego Herrera',   departamento: 'Ventas',     salario: 26000, antiguedad: 2,  desempeño: 74, horas_extra: 8,  ausencias: 7 },
  { id: 7, nombre: 'Lucía Flores',    departamento: 'RRHH',       salario: 29000, antiguedad: 4,  desempeño: 85, horas_extra: 2,  ausencias: 3 },
  { id: 8, nombre: 'Roberto Sánchez', departamento: 'Operaciones',salario: 33000, antiguedad: 7,  desempeño: 81, horas_extra: 15, ausencias: 4 },
  { id: 9, nombre: 'Valeria Moreno',  departamento: 'Marketing',  salario: 34000, antiguedad: 5,  desempeño: 90, horas_extra: 10, ausencias: 1 },
  { id: 10,nombre: 'Andrés Vega',     departamento: 'Finanzas',   salario: 40000, antiguedad: 9,  desempeño: 83, horas_extra: 5,  ausencias: 2 },
];

export const mockCampanasMarketing = [
  { id: 1, campaña: 'Black Friday',      canal: 'Email',        presupuesto: 50000, clicks: 12400, conversiones: 980,  roi: 4.2, mes: 'Nov' },
  { id: 2, campaña: 'Año Nuevo',         canal: 'Social Media', presupuesto: 35000, clicks: 9800,  conversiones: 620,  roi: 2.8, mes: 'Ene' },
  { id: 3, campaña: 'Día de la Madre',   canal: 'Google Ads',   presupuesto: 42000, clicks: 15600, conversiones: 1340, roi: 5.1, mes: 'May' },
  { id: 4, campaña: 'Regreso a Clases',  canal: 'Display',      presupuesto: 28000, clicks: 7200,  conversiones: 410,  roi: 1.9, mes: 'Ago' },
  { id: 5, campaña: 'Hot Sale',          canal: 'Email',        presupuesto: 60000, clicks: 22000, conversiones: 2100, roi: 6.3, mes: 'May' },
  { id: 6, campaña: 'Navidad',           canal: 'Social Media', presupuesto: 75000, clicks: 30000, conversiones: 2800, roi: 7.1, mes: 'Dic' },
  { id: 7, campaña: 'San Valentín',      canal: 'Google Ads',   presupuesto: 20000, clicks: 8400,  conversiones: 530,  roi: 3.4, mes: 'Feb' },
  { id: 8, campaña: 'Buen Fin',          canal: 'Display',      presupuesto: 55000, clicks: 18900, conversiones: 1650, roi: 5.8, mes: 'Nov' },
  { id: 9, campaña: 'Verano',            canal: 'Email',        presupuesto: 32000, clicks: 11200, conversiones: 740,  roi: 2.5, mes: 'Jul' },
  { id: 10,campaña: 'Lanzamiento App',   canal: 'Social Media', presupuesto: 48000, clicks: 25600, conversiones: 3200, roi: 8.0, mes: 'Mar' },
];

export type MockDataset = 'productos' | 'ventas_regionales' | 'empleados' | 'campanas_marketing';

export const DATASETS: Record<MockDataset, { label: string; file: string; data: object[] }> = {
  productos:           { label: 'productos.xlsx',           file: 'productos.xlsx',           data: mockProducts },
  ventas_regionales:   { label: 'ventas_regionales.xlsx',   file: 'ventas_regionales.xlsx',   data: mockVentasRegionales },
  empleados:           { label: 'empleados.xlsx',           file: 'empleados.xlsx',           data: mockEmpleados },
  campanas_marketing:  { label: 'campanas_marketing.xlsx',  file: 'campanas_marketing.xlsx',  data: mockCampanasMarketing },
};
