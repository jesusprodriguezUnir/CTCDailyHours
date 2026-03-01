import { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'

function getRoleBadge(role) {
  switch (role) {
    case 'admin':
      return { text: 'Administrador', color: 'bg-red-100 text-red-800 border-red-300', emoji: '🔴' }
    case 'responsible':
      return { text: 'Responsable', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', emoji: '🟡' }
    default:
      return { text: 'Empleado', color: 'bg-green-100 text-green-800 border-green-300', emoji: '🟢' }
  }
}

export function Layout({ children, user, onLogout }) {
  const [showMenu, setShowMenu] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  const roleBadge = user ? getRoleBadge(user.role) : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-blue-800 dark:bg-blue-950 text-white p-4 shadow-lg transition-colors duration-200">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">CTC - Registro Horas</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 mr-2 rounded-lg bg-blue-700 hover:bg-blue-600 dark:bg-blue-900 dark:hover:bg-blue-800 transition-colors"
              title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {isDark ? (
                <span className="text-yellow-400">☀️</span>
              ) : (
                <span className="text-white">🌙</span>
              )}
            </button>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {showMenu && user && (
          <div className="mt-4 pb-2">
            <div className="mb-3">
              <div className="text-sm font-medium mb-2">{user.name}</div>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${roleBadge.color} dark:bg-opacity-20`}>
                <span>{roleBadge.emoji}</span>
                <span>{roleBadge.text}</span>
              </span>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </header>

      <main className="p-4 pb-20">
        {children}
      </main>
    </div>
  )
}
