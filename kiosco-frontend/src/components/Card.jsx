export function Card({ children, className = '', hover = true, gradient = false, onClick }) {
  const baseStyles = "bg-white dark:bg-gray-800 rounded-xl shadow-md transition-all duration-300 p-6";
  const hoverStyles = hover ? "hover:shadow-xl hover:scale-[1.02] cursor-pointer" : "";
  const gradientStyles = gradient ? "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900" : "";
  
  return (
    <div 
      className={`${baseStyles} ${hoverStyles} ${gradientStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function StatCard({ icon: Icon, titulo, valor, descripcion, color = 'blue', trend }) {
  const colores = {
    blue: 'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700',
    green: 'from-green-500 to-green-600 dark:from-green-600 dark:to-green-700',
    yellow: 'from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700',
    red: 'from-red-500 to-red-600 dark:from-red-600 dark:to-red-700',
    purple: 'from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700',
    pink: 'from-pink-500 to-pink-600 dark:from-pink-600 dark:to-pink-700',
  };

  return (
    <div className={`bg-gradient-to-br ${colores[color]} text-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl`}>
      <div className="flex items-center justify-between mb-4">
        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
          <Icon size={28} />
        </div>
        {trend && (
          <span className="text-sm opacity-90 bg-white/20 px-3 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-4xl font-bold mb-2">{valor}</p>
      <p className="text-sm opacity-90 font-medium">{titulo}</p>
      {descripcion && (
        <p className="text-xs opacity-75 mt-2">{descripcion}</p>
      )}
    </div>
  );
}