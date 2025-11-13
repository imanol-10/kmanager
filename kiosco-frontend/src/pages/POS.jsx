import { useState, useEffect } from 'react';
import { 
  ShoppingCart, Search, Plus, Minus, Trash2, DollarSign, 
  CreditCard, Smartphone, X, Check 
} from 'lucide-react';
import { productosAPI, ventasAPI } from '../services/api';
import ProductImage from '../components/ProductImage';
import Toast from '../components/Toast';
import CantidadPesoModal from '../components/CantidadPesoModal';

export default function POS() {
  // Estados
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [productoParaPeso, setProductoParaPeso] = useState(null);

  const mostrarToast = (mensaje, tipo) => {
    setToast({ mensaje, tipo });
  };

  // Cargar productos y categorías al iniciar
  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await productosAPI.obtenerTodos();
      setProductos(response.data);
    } catch (error) {
      mostrarToast('Error al cargar productos', 'error');
    }
  };

  const cargarCategorias = async () => {
    try {
      const response = await productosAPI.obtenerCategorias();
      setCategorias(['Todas', ...response.data]);
    } catch (error) {
      console.error('Error al cargar categorías', error);
    }
  };

  // Filtrar productos
  const productosFiltrados = productos.filter(p => {
    const coincideCategoria = categoriaSeleccionada === 'Todas' || 
                              p.categoria === categoriaSeleccionada;
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda && p.stockActual > 0;
  });

  // Agregar producto al carrito
  const agregarAlCarrito = (producto) => {
    // Si es por peso, abrir modal
    if (producto.tipoVenta === 'PESO') {
      setProductoParaPeso(producto);
      return;
    }
    
    // Lógica normal para productos por unidad
    const itemExistente = carrito.find(item => item.id === producto.id);
    
    if (itemExistente) {
      if (itemExistente.cantidad < producto.stockActual) {
        setCarrito(carrito.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        ));
      } else {
        mostrarToast('Stock insuficiente', 'warning');
      }
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };
  
  // Agregar producto por peso con cantidad específica
  const agregarProductoPorPeso = (cantidad) => {
    if (!productoParaPeso) return;
    
    const itemExistente = carrito.find(item => item.id === productoParaPeso.id);
    
    if (itemExistente) {
      setCarrito(carrito.map(item =>
        item.id === productoParaPeso.id
          ? { ...item, cantidad: parseFloat((item.cantidad + cantidad).toFixed(2)) }
          : item
      ));
    } else {
      setCarrito([...carrito, { ...productoParaPeso, cantidad }]);
    }
    
    setProductoParaPeso(null);
  };

  // Modificar cantidad en el carrito
  const modificarCantidad = (id, cambio) => {
    setCarrito(carrito.map(item => {
      if (item.id === id) {
        const incremento = item.tipoVenta === 'PESO' ? (item.incrementoMinimo || 0.5) : 1;
        const nuevaCantidad = parseFloat((item.cantidad + (cambio * incremento)).toFixed(2));
        
        if (nuevaCantidad <= 0) return null;
        if (nuevaCantidad > item.stockActual) {
          mostrarToast('Stock insuficiente', 'warning');
          return item;
        }
        return { ...item, cantidad: nuevaCantidad };
      }
      return item;
    }).filter(Boolean));
  };

  // Eliminar del carrito
  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  // Calcular totales
  const subtotal = carrito.reduce((sum, item) => sum + (item.precioVenta * item.cantidad), 0);
  const total = subtotal;

  // Calcular cambio
  const cambio = montoRecibido ? parseFloat(montoRecibido) - total : 0;

  // Finalizar venta
  const finalizarVenta = async () => {
    if (carrito.length === 0) {
      mostrarToast('El carrito está vacío', 'warning');
      return;
    }

    if (metodoPago === 'Efectivo' && cambio < 0) {
      mostrarToast('Monto insuficiente', 'warning');
      return;
    }

    setLoading(true);
    try {
      const items = {};
      carrito.forEach(item => {
        items[item.id] = item.cantidad;
      });

      const venta = {
        metodoPago,
        items,
      };

      await ventasAPI.registrar(venta);
      
      mostrarToast('¡Venta registrada exitosamente!', 'success');
      
      // Limpiar carrito y cerrar modal
      setCarrito([]);
      setMostrarModal(false);
      setMontoRecibido('');
      
      // Recargar productos para actualizar stock
      cargarProductos();
      
    } catch (error) {
      mostrarToast(error.mensaje || 'Error al registrar la venta', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors duration-300">
      {/* Notificaciones Toast */}
      {toast && (
        <Toast
          mensaje={toast.mensaje}
          tipo={toast.tipo}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Punto de Venta
          </h1>
          <p className="text-gray-600">Sistema POS - K-Manager</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de Productos */}
          <div className="lg:col-span-2 space-y-4">
            {/* Búsqueda y Filtros */}
            <div className="card">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Búsqueda */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>

              {/* Categorías */}
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {categorias.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoriaSeleccionada(cat)}
                    className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                      categoriaSeleccionada === cat
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid de Productos */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {productosFiltrados.map(producto => (
                <button
                  key={producto.id}
                  onClick={() => agregarAlCarrito(producto)}
                  className="card hover:scale-105 transition-transform cursor-pointer text-left group"
                >
                  {/* Imagen del producto */}
                  <div className="mb-3 flex justify-center">
                    <ProductImage
                      src={producto.imagenUrl}
                      alt={producto.nombre}
                      size="lg"
                      className="group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">
                    {producto.nombre}
                  </h3>
                  <div className="mb-2">
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      ${producto.precioVenta.toFixed(2)}
                    </p>
                    {producto.tipoVenta === 'PESO' && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        por {producto.unidadMedida}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${
                      producto.stockActual < producto.stockMinimo
                        ? 'text-red-600 dark:text-red-400 font-semibold'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      Stock: {producto.stockActual}
                    </span>
                    <span className="badge bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs">
                      {producto.categoria}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {productosFiltrados.length === 0 && (
              <div className="card text-center py-12">
                <p className="text-gray-500 text-lg">
                  No se encontraron productos
                </p>
              </div>
            )}
          </div>

          {/* Panel de Carrito */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="text-primary-600" size={24} />
                <h2 className="text-2xl font-bold">Carrito</h2>
                <span className="ml-auto badge badge-primary">
                  {carrito.length}
                </span>
              </div>

              {/* Items del carrito */}
              <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                {carrito.map(item => (
                  <div key={item.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                          {item.nombre}
                        </h4>
                        {item.tipoVenta === 'PESO' && (
                          <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold">
                            ${item.precioVenta.toFixed(2)}/{item.unidadMedida}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => eliminarDelCarrito(item.id)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 ml-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => modificarCantidad(item.id, -1)}
                          className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 p-1 rounded transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-bold w-16 text-center text-gray-800 dark:text-gray-200">
                          {item.cantidad} {item.tipoVenta === 'PESO' ? item.unidadMedida : 'un'}
                        </span>
                        <button
                          onClick={() => modificarCantidad(item.id, 1)}
                          className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 p-1 rounded transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      <span className="font-bold text-primary-600 dark:text-primary-400">
                        ${(item.precioVenta * item.cantidad).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}

                {carrito.length === 0 && (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                    <ShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
                    <p>Carrito vacío</p>
                  </div>
                )}
              </div>

              {/* Totales */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-primary-600">
                  <span>TOTAL:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Botón Finalizar */}
              <button
                onClick={() => setMostrarModal(true)}
                disabled={carrito.length === 0}
                className="btn-success w-full mt-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={20} className="inline mr-2" />
                Finalizar Venta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Pago */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Finalizar Venta</h2>
              <button
                onClick={() => setMostrarModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Método de Pago */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">Método de Pago</label>
              <div className="grid grid-cols-3 gap-2">
                {['Efectivo', 'Tarjeta', 'QR'].map(metodo => (
                  <button
                    key={metodo}
                    onClick={() => setMetodoPago(metodo)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      metodoPago === metodo
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-300'
                    }`}
                  >
                    {metodo === 'Efectivo' && <DollarSign className="mx-auto mb-1" size={24} />}
                    {metodo === 'Tarjeta' && <CreditCard className="mx-auto mb-1" size={24} />}
                    {metodo === 'QR' && <Smartphone className="mx-auto mb-1" size={24} />}
                    <p className="text-xs font-semibold">{metodo}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Monto Recibido (solo para Efectivo) */}
            {metodoPago === 'Efectivo' && (
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Monto Recibido</label>
                <input
                  type="number"
                  value={montoRecibido}
                  onChange={(e) => setMontoRecibido(e.target.value)}
                  placeholder="0.00"
                  className="input text-2xl font-bold text-right"
                  step="0.01"
                />
              </div>
            )}

            {/* Resumen */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between text-lg">
                <span>Total a Pagar:</span>
                <span className="font-bold">${total.toFixed(2)}</span>
              </div>
              {metodoPago === 'Efectivo' && montoRecibido && (
                <>
                  <div className="flex justify-between">
                    <span>Recibido:</span>
                    <span className="font-semibold">${parseFloat(montoRecibido).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-primary-600 pt-2 border-t">
                    <span>Cambio:</span>
                    <span>${cambio >= 0 ? cambio.toFixed(2) : '0.00'}</span>
                  </div>
                </>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={() => setMostrarModal(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={finalizarVenta}
                disabled={loading || (metodoPago === 'Efectivo' && cambio < 0)}
                className="btn-success flex-1 disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de selección de peso */}
      {productoParaPeso && (
        <CantidadPesoModal
          producto={productoParaPeso}
          onConfirmar={agregarProductoPorPeso}
          onCancelar={() => setProductoParaPeso(null)}
        />
      )}
    </div>
  );
}