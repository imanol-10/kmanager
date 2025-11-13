import { useState } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';

export default function CantidadPesoModal({ producto, onConfirmar, onCancelar }) {
  const [cantidad, setCantidad] = useState(producto.incrementoMinimo || 0.5);
  
  const incremento = producto.incrementoMinimo || 0.5;
  const unidad = producto.unidadMedida || 'kg';
  
  const incrementar = () => {
    setCantidad(prev => parseFloat((prev + incremento).toFixed(2)));
  };
  
  const decrementar = () => {
    if (cantidad > incremento) {
      setCantidad(prev => parseFloat((prev - incremento).toFixed(2)));
    }
  };
  
  const calcularPrecio = () => {
    return (cantidad * producto.precioVenta).toFixed(2);
  };
  
  const handleConfirmar = () => {
    if (cantidad > 0) {
      onConfirmar(cantidad);
    }
  };
  
  // Botones rápidos para cantidades comunes
  const cantidadesRapidas = [0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Seleccionar Cantidad
          </h2>
          <button
            onClick={onCancelar}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Información del producto */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">
            {producto.nombre}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ${producto.precioVenta.toFixed(2)} por {unidad}
          </p>
        </div>

       {/* Control de cantidad con +/- */}
<div className="mb-6">
  <label className="block text-sm font-semibold mb-3 text-gray-600 dark:text-gray-300">
    Cantidad ({unidad})
  </label>

  <div className="flex items-center justify-center gap-4">
    <button
      onClick={decrementar}
      className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg transition-colors active:scale-95"
    >
      <Minus size={24} />
    </button>

    <input
      type="number"
      step={incremento}
      min={incremento}
      value={cantidad}
      onChange={(e) => {
        const val = parseFloat(e.target.value);
        if (val >= incremento) {
          setCantidad(val);
        }
      }}
      className="flex-[0.3] text-center text-3xl font-bold py-3 px-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
    />

    <button
      onClick={incrementar}
      className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg transition-colors active:scale-95"
    >
      <Plus size={24} />
    </button>
  </div>

  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
    Incrementos de {incremento} {unidad}
  </p>
</div>


        {/* Botones rápidos */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Cantidades Rápidas:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {cantidadesRapidas
              .filter(c => c >= incremento)
              .map(cant => (
                <button
                  key={cant}
                  onClick={() => setCantidad(cant)}
                  className={`py-2 px-3 rounded-lg font-semibold transition-all ${
                    cantidad === cant
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {cant} {unidad}
                </button>
              ))}
          </div>
        </div>

        {/* Resumen del precio */}
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total a pagar:</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {cantidad} {unidad} × ${producto.precioVenta.toFixed(2)}
              </p>
            </div>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              ${calcularPrecio()}
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3">
          <button
            onClick={onCancelar}
            className="btn-secondary flex-1"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            className="btn-success flex-1"
          >
            <Check size={20} className="inline mr-2" />
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  );
}