import axios from 'axios';

// URL base de tu backend
const API_URL = 'http://192.168.1.112:8080/api';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========== PRODUCTOS ==========

export const productosAPI = {
  // Obtener todos los productos
  obtenerTodos: () => api.get('/productos'),
  
  // Obtener producto por ID
  obtenerPorId: (id) => api.get(`/productos/${id}`),
  
  // Crear producto
  crear: (producto) => api.post('/productos', producto),
  
  // Actualizar producto
  actualizar: (id, producto) => api.put(`/productos/${id}`, producto),
  
  // Eliminar producto
  eliminar: (id) => api.delete(`/productos/${id}`),
  
  // Buscar por categoría
  buscarPorCategoria: (categoria) => 
    api.get('/productos/buscar/categoria', { params: { nombre: categoria } }),
  
  // Buscar por nombre
  buscarPorNombre: (texto) => 
    api.get('/productos/buscar/nombre', { params: { texto } }),
  
  // Obtener categorías
  obtenerCategorias: () => api.get('/productos/categorias'),
  
  // Ajustar stock
  ajustarStock: (id, cantidad) => 
    api.patch(`/productos/${id}/stock`, { cantidad }),

  //Codigo de barra
  buscarPorCodigoBarras: (codigo) => 
    api.get('/productos/buscar/codigo-barras', {params: {codigo} }),
};

// ========== VENTAS ==========

export const ventasAPI = {
  // Registrar venta
  registrar: (venta) => api.post('/ventas', venta),
  
  // Obtener todas las ventas
  obtenerTodas: () => api.get('/ventas'),
  
  // Obtener venta por ID
  obtenerPorId: (id) => api.get(`/ventas/${id}`),
  
  // Obtener ventas del día
  obtenerDiarias: () => api.get('/ventas/diarias'),
  
  // Obtener últimas ventas
  obtenerUltimas: () => api.get('/ventas/ultimas'),
  
  // Total vendido hoy
  totalDiario: () => api.get('/ventas/total/diario'),
  
  // Ventas por método de pago
  porMetodoPago: (metodo) => 
    api.get('/ventas/metodo-pago', { params: { metodo } }),
};

// ========== REPORTES ==========

export const reportesAPI = {
  // Productos con stock bajo
  stockBajo: () => api.get('/reportes/stock-bajo'),
  
  // Cantidad de productos con stock bajo
  stockBajoCount: () => api.get('/reportes/stock-bajo/count'),
};

// Interceptor para manejo de errores global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la petición:', error);
    
    if (error.response) {
      // El servidor respondió con un código de error
      const mensaje = error.response.data?.mensaje || 
                     error.response.data?.message ||
                     'Error en el servidor';
      
      return Promise.reject({
        status: error.response.status,
        mensaje,
        data: error.response.data,
      });
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      return Promise.reject({
        status: 0,
        mensaje: 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.',
      });
    } else {
      // Algo más pasó
      return Promise.reject({
        status: -1,
        mensaje: error.message,
      });
    }
  }
);

export default api;