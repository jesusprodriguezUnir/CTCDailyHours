import { useState } from 'react'
import { Layout } from './components/Layout'
import { Login } from './components/Login'
import { WeeklyCalendar } from './components/WeeklyCalendar'
import { SummaryTable } from './components/SummaryTable'
import { DayView } from './components/DayView'
import { AdminPanel } from './components/AdminPanel'
import { useTimeEntries } from './hooks/useTimeEntries'

function App() {
  const [user, setUser] = useState(null)
  const [activeView, setActiveView] = useState('calendar')
  const { entries, loading, addEntry, updateEntry, deleteEntry } = useTimeEntries()

  const isResponsible = user?.role === 'responsible'
  const isAdmin = user?.role === 'admin'

  const handleLogin = (employee) => {
    setUser(employee)
    setActiveView('calendar') // Reset a vista principal al login
  }

  const handleLogout = () => {
    setUser(null)
    setActiveView('calendar')
  }

  const renderContent = () => {
    if (!user) {
      return <Login onLogin={handleLogin} />
    }

    return (
      <div className="min-h-screen bg-gray-100">
        {/* Navegación de vistas */}
        <div className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex overflow-x-auto">
              <button
                onClick={() => setActiveView('calendar')}
                className={`
                  px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${activeView === 'calendar'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <span>📅</span>
                  <span>Calendario</span>
                </span>
              </button>

              <button
                onClick={() => setActiveView('summary')}
                className={`
                  px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${activeView === 'summary'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <span>📊</span>
                  <span>Resumen</span>
                </span>
              </button>

              <button
                onClick={() => setActiveView('day')}
                className={`
                  px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${activeView === 'day'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <span>📋</span>
                  <span>Detalle Día</span>
                </span>
              </button>

              {/* Solo mostrar administración para admin */}
              {isAdmin && (
                <button
                  onClick={() => setActiveView('admin')}
                  className={`
                    px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                    ${activeView === 'admin'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    <span>⚙️</span>
                    <span>Administración</span>
                  </span>
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Contenido de la vista activa */}
        <div className="max-w-7xl mx-auto">
          {activeView === 'calendar' && (
            <WeeklyCalendar
              entries={entries}
              onAdd={addEntry}
              onUpdate={updateEntry}
              onDelete={deleteEntry}
              user={user}
              isResponsible={isResponsible}
            />
          )}

          {activeView === 'summary' && (
            <SummaryTable />
          )}

          {activeView === 'day' && (
            <DayView
              user={user}
              isResponsible={isResponsible}
            />
          )}

          {activeView === 'admin' && isAdmin && (
            <AdminPanel />
          )}
        </div>
      </div>
    )
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  )
}

export default App
