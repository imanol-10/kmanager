import { Loader2 } from 'lucide-react';

export default function Loading({ fullScreen = false, mensaje = 'Cargando...' }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 flex items-center justify-center z-50 transition-colors duration-300">
        <div className="text-center">
          <div className="relative">
            {/* Círculo animado de fondo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 border-4 border-primary-200 dark:border-primary-900 rounded-full animate-pulse"></div>
            </div>
            {/* Icono rotatorio */}
            <Loader2 className="w-20 h-20 text-primary-600 dark:text-primary-400 animate-spin" />
          </div>
          <p className="mt-6 text-gray-600 dark:text-gray-400 font-semibold text-lg animate-pulse">
            {mensaje}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary-600 dark:text-primary-400 animate-spin mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400 font-semibold">{mensaje}</p>
      </div>
    </div>
  );
}

// Componente pequeño para botones
export function LoadingButton() {
  return <Loader2 className="animate-spin inline-block" size={18} />;
}