import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Store, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/pos', icon: ShoppingCart, label: 'Punto de Venta' },
    { to: '/inventario', icon: Package, label: 'Inventario' },
  ];

  return (
    <nav className="bg-gradient-to-r from-primary-600 to-blue-600 dark:from-gray-800 dark:to-gray-900 text-white shadow-lg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-gray-700 p-2 rounded-lg transition-colors duration-300">
              <Store className="text-primary-600 dark:text-primary-400" size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Kiosco Tinga</h1>
              <p className="text-xs opacity-90">Sistema POS</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-lg'
                      : 'hover:bg-white/10 dark:hover:bg-gray-700/50'
                  }`
                }
              >
                <item.icon size={20} />
                <span className="hidden md:inline">{item.label}</span>
              </NavLink>
            ))}
            
            {/* Toggle Tema */}
            <button
              onClick={toggleTheme}
              className="ml-4 p-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-700/50 transition-all"
              title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
            >
              {theme === 'light' ? (
                <Moon size={20} className="animate-fade-in" />
              ) : (
                <Sun size={20} className="animate-fade-in" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}