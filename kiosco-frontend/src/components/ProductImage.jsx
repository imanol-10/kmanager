import { useState } from 'react';
import { Package, ImageOff } from 'lucide-react';

export default function ProductImage({ src, alt, className = '', size = 'md' }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 48,
    xl: 64,
  };

  // Si no hay imagen o hubo error, mostrar placeholder
  if (!src || error) {
    return (
      <div className={`${sizes[size]} ${className} bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center`}>
        <Package 
          size={iconSizes[size]} 
          className="text-gray-400 dark:text-gray-500" 
        />
      </div>
    );
  }

  return (
    <div className={`${sizes[size]} ${className} relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-200 border-t-primary-600"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
      />
    </div>
  );
}

// Componente para vista de lista con imagen pequeña
export function ProductImageSmall({ src, alt, nombre }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-lg flex items-center justify-center flex-shrink-0">
        <span className="text-primary-700 dark:text-primary-300 font-bold text-sm">
          {nombre?.charAt(0).toUpperCase() || 'P'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
      onError={() => setError(true)}
    />
  );
}