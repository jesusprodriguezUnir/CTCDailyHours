import { useState } from 'react'

export function Layout({ children, user, onLogout }) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-800 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">CTC - Registro Horas</h1>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg hover:bg-blue-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {showMenu && (
          <div className="mt-4 pb-2">
            <div className="text-sm opacity-80 mb-2">
              {user?.name} ({user?.role === 'responsible' ? 'Responsable' : 'Empleado'})
            </div>
            <button
              onClick={onLogout}
              className="bg-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-700"
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
