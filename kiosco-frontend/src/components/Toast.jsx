import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ mensaje, tipo = 'info', onClose, duracion = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duracion);

    return () => clearTimeout(timer);
  }, [duracion, onClose]);

  const iconos = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const estilos = {
    success: 'bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700',
    error: 'bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700',
    info: 'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700',
  };

  const Icono = iconos[tipo];

  return (
    <div className={`fixed top-4 right-4 z-50 ${estilos[tipo]} text-white rounded-xl shadow-2xl animate-slide-up max-w-md`}>
      <div className="flex items-center gap-3 p-4">
        <Icono size={24} className="flex-shrink-0" />
        <p className="font-semibold flex-1">{mensaje}</p>
        <button
          onClick={onClose}
          className="hover:bg-white/20 rounded-lg p-1 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      
      {/* Barra de progreso */}
      <div className="h-1 bg-white/30 overflow-hidden">
        <div 
          className="h-full bg-white animate-progress"
          style={{
            animation: `progress ${duracion}ms linear`
          }}
        />
      </div>
      
      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}