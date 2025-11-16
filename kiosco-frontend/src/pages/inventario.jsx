import { useState, useEffect } from 'react';
import { 
  Package, Plus, Edit, Trash2, Search, AlertTriangle, 
  Save, X, TrendingUp, TrendingDown 
} from 'lucide-react';
import { productosAPI } from '../services/api';
import ProductImage, { ProductImageSmall } from '../components/ProductImage';
import Toast from '../components/Toast';

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [categorias, setCategorias] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const mostrarToast = (mensaje, tipo) => {
    setToast({ mensaje, tipo });
  };
  
  // Form state
  const [form, setForm] = useState({
    nombre: '',
    codigoBarras: '',
    precioVenta: '',
    precioCosto: '',
    stockActual: '',
    stockMinimo: '',
    categoria: '',
    imagenUrl: '',
    tipoVenta: 'UNIDAD',
    unidadMedida: 'unidad',
    incrementoMinimo: '1',
  });

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
      console.error('Error al cargar categorías');
    }
  };

  const productosFiltrados = productos.filter(p => {
    const coincideCategoria = categoriaFiltro === 'Todas' || p.categoria === categoriaFiltro;
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  const abrirModal = (producto = null) => {
    if (producto) {
      setProductoEditando(producto);
      setForm({
        nombre: producto.nombre || '',
        codigoBarras: producto.codigoBarras || '',
        precioVenta: producto.precioVenta || '',
        precioCosto: producto.precioCosto || '',
        stockActual: producto.stockActual || '',
        stockMinimo: producto.stockMinimo || '',
        categoria: producto.categoria || '',
        imagenUrl: producto.imagenUrl || '',
        tipoVenta: producto.tipoVenta || 'UNIDAD',
        unidadMedida: producto.unidadMedida || 'unidad',
        incrementoMinimo: producto.incrementoMinimo || '1',
      });
    } else {
      setProductoEditando(null);
      setForm({
        nombre: '',
        codigoBarras: '',
        precioVenta: '',
        precioCosto: '',
        stockActual: '',
        stockMinimo: '',
        categoria: '',
        imagenUrl: '',
        tipoVenta: 'UNIDAD',
        unidadMedida: 'unidad',
        incrementoMinimo: '1',
      });
    }
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setProductoEditando(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...form,
        precioVenta: parseFloat(form.precioVenta),
        precioCosto: parseFloat(form.precioCosto),
        stockActual: parseInt(form.stockActual),
        stockMinimo: parseInt(form.stockMinimo),
        incrementoMinimo: parseFloat(form.incrementoMinimo),
      };

      console.log('Datos que se envian:',  data);

      if (productoEditando) {
        await productosAPI.actualizar(productoEditando.id, data);
        mostrarToast('Producto actualizado exitosamente', 'success');
      } else {
        await productosAPI.crear(data);
        mostrarToast('Producto creado exitosamente', 'success');
      }

      cargarProductos();
      cerrarModal();
    } catch (error) {
      mostrarToast(error.mensaje || 'Error al guardar producto', 'error');
    } finally {
      setLoading(false);
    }
  };

  const eliminarProducto = async (id, nombre) => {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;

    try {
      await productosAPI.eliminar(id);
      mostrarToast('Producto eliminado', 'success');
      await cargarProductos();
    } catch (error) {
      if(error.status === 404) {
        mostrarToast('El producto ya no existe', 'warning');
      } else if (error.status === 500) {
        mostrarToast('Error del servidor al eliminar', 'error');
      } else {
        mostrarToast(error.mensaje || 'Error al eliminar producto', 'error');
      }

      await cargarProductos();
    }
  };

  const ajustarStock = async (id, cambio) => {
    try {
      await productosAPI.ajustarStock(id, cambio);
      cargarProductos();
      mostrarToast(cambio > 0 ? 'Stock incrementado' : 'Stock decrementado', 'success');
    } catch (error) {
      mostrarToast('Error al ajustar stock', 'error');
    }
  };

  const productosStockBajo = productos.filter(p => p.stockActual < p.stockMinimo).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors duration-300">
      {toast && (
        <Toast
          mensaje={toast.mensaje}
          tipo={toast.tipo}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Inventario
            </h1>
            <p className="text-gray-600">Gestión de productos</p>
          </div>
          <button
            onClick={() => abrirModal()}
            className="btn-primary"
          >
            <Plus size={20} className="inline mr-2" />
            Nuevo Producto
          </button>
        </div>

        {/* Alerta de Stock Bajo */}
        {productosStockBajo > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="text-yellow-600 mr-3" size={24} />
              <div>
                <p className="font-semibold text-yellow-800">
                  {productosStockBajo} producto{productosStockBajo > 1 ? 's' : ''} con stock bajo
                </p>
                <p className="text-sm text-yellow-700">
                  Revisa los productos marcados para reabastecer
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
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

          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoriaFiltro(cat)}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  categoriaFiltro === cat
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla de Productos */}
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-4 font-semibold">Producto</th>
                <th className="text-left py-4 px-4 font-semibold">Categoría</th>
                <th className="text-right py-4 px-4 font-semibold">Precio</th>
                <th className="text-center py-4 px-4 font-semibold">Stock</th>
                <th className="text-center py-4 px-4 font-semibold">Ajustes</th>
                <th className="text-center py-4 px-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
                              {productosFiltrados.map(producto => (
                <tr key={producto.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <ProductImageSmall
                        src={producto.imagenUrl}
                        alt={producto.nombre}
                        nombre={producto.nombre}
                      />
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{producto.nombre}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Costo: ${producto.precioCosto.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="badge bg-primary-100 text-primary-800">
                      {producto.categoria}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <p className="font-bold text-lg text-primary-600">
                      ${producto.precioVenta.toFixed(2)}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <p className={`text-2xl font-bold ${
                        producto.stockActual < producto.stockMinimo
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}>
                        {producto.stockActual}
                      </p>
                      <p className="text-xs text-gray-500">
                        Mín: {producto.stockMinimo}
                      </p>
                      {producto.stockActual < producto.stockMinimo && (
                        <span className="badge-danger text-xs mt-1">
                          ¡Reponer!
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => ajustarStock(producto.id, -1)}
                        className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                        title="Restar 1"
                      >
                        <TrendingDown size={18} className="text-red-600" />
                      </button>
                      <button
                        onClick={() => ajustarStock(producto.id, 1)}
                        className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                        title="Sumar 1"
                      >
                        <TrendingUp size={18} className="text-green-600" />
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => abrirModal(producto)}
                        className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                      >
                        <Edit size={18} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => eliminarProducto(producto.id, producto.nombre)}
                        className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {productosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No se encontraron productos</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear/Editar */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {productoEditando ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button
                onClick={cerrarModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Nombre del Producto</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({...form, nombre: e.target.value})}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                 Código de Barras (opcional)
                </label>
                <input
                 type="text"
                 value={form.codigoBarras}
                 onChange={(e) => setForm({...form, codigoBarras: e.target.value})}
                 className="input"
                 placeholder="7790001234567"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Escanea o ingresa el código de barras del producto
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Precio de Venta</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.precioVenta}
                    onChange={(e) => setForm({...form, precioVenta: e.target.value})}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Precio de Costo</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.precioCosto}
                    onChange={(e) => setForm({...form, precioCosto: e.target.value})}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Stock Actual</label>
                  <input
                    type="number"
                    value={form.stockActual}
                    onChange={(e) => setForm({...form, stockActual: e.target.value})}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Stock Mínimo</label>
                  <input
                    type="number"
                    value={form.stockMinimo}
                    onChange={(e) => setForm({...form, stockMinimo: e.target.value})}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Categoría</label>
                <input
                  type="text"
                  value={form.categoria}
                  onChange={(e) => setForm({...form, categoria: e.target.value})}
                  className="input"
                  placeholder="ej: Bebidas, Snacks, Golosinas"
                  required
                />
              </div>

              {/* Tipo de Venta */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Tipo de Venta</label>
                <select
                  value={form.tipoVenta}
                  onChange={(e) => {
                    const nuevoTipo = e.target.value;
                    setForm({
                      ...form, 
                      tipoVenta: nuevoTipo,
                      unidadMedida: nuevoTipo === 'PESO' ? 'kg' : 'unidad',
                      incrementoMinimo: nuevoTipo === 'PESO' ? '0.1' : '1'
                    });
                  }}
                  className="input"
                >
                  <option value="UNIDAD">Por Unidad</option>
                  <option value="PESO">Por Peso</option>
                </select>
              </div>

              {/* Mostrar campos adicionales si es por peso */}
              {form.tipoVenta === 'PESO' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Unidad de Medida</label>
                    <select
                      value={form.unidadMedida}
                      onChange={(e) => setForm({...form, unidadMedida: e.target.value})}
                      className="input"
                    >
                      <option value="kg">Kilogramos (kg)</option>
                      <option value="g">Gramos (g)</option>
                      <option value="lb">Libras (lb)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Incremento Mínimo
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.incrementoMinimo}
                      onChange={(e) => setForm({...form, incrementoMinimo: e.target.value})}
                      className="input"
                      placeholder="0.5"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ej: 0.5 para vender en medios kilos
                    </p>
                  </div>
                </div>
              )}

              {/* Nota informativa */}
              {form.tipoVenta === 'PESO' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-3 rounded">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    💡 <strong>Productos por peso:</strong> El precio es por {form.unidadMedida}. 
                    Ejemplo: Si cuesta $200/kg, 0.5 kg = $100
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  URL de Imagen (opcional)
                </label>
                <input
                  type="url"
                  value={form.imagenUrl}
                  onChange={(e) => setForm({...form, imagenUrl: e.target.value})}
                  className="input"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Puedes usar enlaces de imágenes públicas de internet
                </p>
                
                {/* Preview de la imagen */}
                {form.imagenUrl && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400">Vista previa:</p>
                    <ProductImage
                      src={form.imagenUrl}
                      alt="Preview"
                      size="xl"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-success flex-1"
                >
                  <Save size={20} className="inline mr-2" />
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}