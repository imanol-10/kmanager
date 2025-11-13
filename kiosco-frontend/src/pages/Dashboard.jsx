import { useState, useEffect } from 'react';
import { 
  TrendingUp, DollarSign, ShoppingCart, Package, 
  AlertTriangle, Calendar, RefreshCw, ArrowUp, ArrowDown
} from 'lucide-react';
import { ventasAPI, productosAPI, reportesAPI } from '../services/api';
import { StatCard } from '../components/Card';
import Loading from '../components/Loading';
import Toast from '../components/Toast';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalDia: 0,
    ventasDia: [],
    productosStockBajo: [],
    totalProductos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [
        totalResponse,
        ventasResponse,
        stockBajoResponse,
        productosResponse,
      ] = await Promise.all([
        ventasAPI.totalDiario(),
        ventasAPI.obtenerDiarias(),
        reportesAPI.stockBajo(),
        productosAPI.obtenerTodos(),
      ]);

      setStats({
        totalDia: totalResponse.data.total || 0,
        ventasDia: ventasResponse.data,
        productosStockBajo: stockBajoResponse.data,
        totalProductos: productosResponse.data.length,
      });
      
      setToast({ mensaje: 'Datos actualizados', tipo: 'success' });
    } catch (error) {
      setToast({ mensaje: 'Error al cargar datos', tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (timestamp) => {
    const fecha = new Date(timestamp);
    return fecha.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return <Loading fullScreen mensaje="Cargando dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors duration-300">
      {toast && (
        <Toast
          mensaje={toast.mensaje}
          tipo={toast.tipo}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2 animate-fade-in">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Calendar size={16} />
              {new Date().toLocaleDateString('es-AR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <button
            onClick={cargarDatos}
            className="btn-primary flex items-center gap-2 group"
          >
            <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
            Actualizar
          </button>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={DollarSign}
            titulo="Total Vendido"
            valor={`${stats.totalDia.toFixed(2)}`}
            descripcion="Ventas del día"
            color="green"
            trend="Hoy"
          />

          <StatCard
            icon={ShoppingCart}
            titulo="Ventas Realizadas"
            valor={stats.ventasDia.length}
            descripcion="Transacciones completadas"
            color="blue"
            trend={stats.ventasDia.length > 0 ? `Promedio: ${(stats.totalDia / stats.ventasDia.length).toFixed(2)}` : null}
          />

          <StatCard
            icon={AlertTriangle}
            titulo="Stock Bajo"
            valor={stats.productosStockBajo.length}
            descripcion={stats.productosStockBajo.length > 0 ? '¡Requiere atención!' : 'Todo en orden'}
            color="yellow"
          />

          <StatCard
            icon={Package}
            titulo="Total Productos"
            valor={stats.totalProductos}
            descripcion="En inventario"
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Últimas Ventas */}
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <ShoppingCart className="text-primary-600" size={24} />
              <h2 className="text-2xl font-bold">Últimas Ventas</h2>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stats.ventasDia.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ShoppingCart size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No hay ventas registradas hoy</p>
                </div>
              ) : (
                stats.ventasDia.map((venta) => (
                  <div key={venta.id} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-700">
                          Venta #{venta.id}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatearFecha(venta.timestamp)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary-600">
                          ${venta.totalVenta.toFixed(2)}
                        </p>
                        <span className="text-xs badge bg-primary-100 text-primary-800">
                          {venta.metodoPago}
                        </span>
                      </div>
                    </div>
                    
                    {venta.itemsVendidos && venta.itemsVendidos.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Productos:</p>
                        <div className="space-y-1">
                          {venta.itemsVendidos.slice(0, 3).map((item, idx) => (
                            <p key={idx} className="text-sm text-gray-600">
                              • {item.cantidad}x {item.producto?.nombre || 'Producto'}
                            </p>
                          ))}
                          {venta.itemsVendidos.length > 3 && (
                            <p className="text-xs text-gray-400">
                              ... y {venta.itemsVendidos.length - 3} más
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Productos con Stock Bajo */}
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="text-yellow-600" size={24} />
              <h2 className="text-2xl font-bold">Productos con Stock Bajo</h2>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stats.productosStockBajo.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Package size={48} className="mx-auto mb-3 opacity-50" />
                  <p>¡Todos los productos tienen stock suficiente!</p>
                </div>
              ) : (
                stats.productosStockBajo.map((producto) => (
                  <div key={producto.id} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 mb-1">
                          {producto.nombre}
                        </p>
                        <span className="badge bg-yellow-100 text-yellow-800 text-xs">
                          {producto.categoria}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-600">
                          {producto.stockActual}
                        </p>
                        <p className="text-xs text-gray-500">
                          Mínimo: {producto.stockMinimo}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm text-yellow-700">
                      <TrendingUp size={16} />
                      <span>
                        Necesita reposición: {producto.stockMinimo - producto.stockActual} unidades
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Resumen Rápido */}
        <div className="card mt-6 bg-gradient-to-r from-primary-600 to-blue-600 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-2xl font-bold mb-2">Sistema K-Manager</h3>
              <p className="opacity-90">
                Sistema de gestión de inventario y punto de venta
              </p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.ventasDia.length}</p>
                <p className="text-sm opacity-90">Ventas Hoy</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">${stats.totalDia.toFixed(2)}</p>
                <p className="text-sm opacity-90">Total del Día</p>
              </div>
              {stats.ventasDia.length > 0 && (
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    ${(stats.totalDia / stats.ventasDia.length).toFixed(2)}
                  </p>
                  <p className="text-sm opacity-90">Promedio por Venta</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}