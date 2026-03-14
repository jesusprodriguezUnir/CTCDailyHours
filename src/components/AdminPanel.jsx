import { useState } from 'react'
import { Users, ClipboardList, Building2, Layers, Settings, Database } from 'lucide-react'
import { EmployeeManagement } from './EmployeeManagement'
import { TaskManagement } from './TaskManagement'
import { WorkCenterManagement } from './WorkCenterManagement'
import { DepartmentManagement } from './DepartmentManagement'
import { DatabaseManagement } from './DatabaseManagement'

export function AdminPanel({ user }) {
  const isAdmin = user?.role === 'admin'
  const [activeTab, setActiveTab] = useState('employees')

  const tabs = [
    { id: 'employees',   label: 'Empleados',     icon: Users },
    { id: 'tasks',       label: 'Tareas',         icon: ClipboardList },
    { id: 'centers',     label: 'Centros',        icon: Building2 },
    { id: 'departments', label: 'Departamentos',  icon: Layers },
    // Solo visible para administradores
    ...(isAdmin ? [{ id: 'database', label: 'Base de Datos', icon: Database, danger: true }] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 shadow-md mb-6 transition-colors duration-200">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-600 dark:text-blue-500" strokeWidth={2.5} />
              <span>Panel de Administración</span>
            </h1>
          </div>

          {/* Tabs Navigation */}
          <div className="border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                const isDanger = tab.danger
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2
                      ${isActive
                        ? isDanger
                          ? 'border-red-500 text-red-600 dark:border-red-500 dark:text-red-400'
                          : 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
                        : isDanger
                          ? 'border-transparent text-red-400 hover:text-red-600 hover:border-red-300 dark:text-red-600 dark:hover:text-red-400 dark:hover:border-red-800'
                          : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-700'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${
                      isActive
                        ? isDanger ? 'text-red-500 dark:text-red-400' : 'text-blue-600 dark:text-blue-500'
                        : isDanger ? 'text-red-400 dark:text-red-600' : 'text-gray-400 dark:text-gray-500'
                    }`} />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg transition-colors duration-200">
          {activeTab === 'employees'   && <EmployeeManagement />}
          {activeTab === 'tasks'       && <TaskManagement />}
          {activeTab === 'centers'     && <WorkCenterManagement />}
          {activeTab === 'departments' && <DepartmentManagement />}
          {activeTab === 'database'    && isAdmin && <DatabaseManagement user={user} />}
        </div>
      </div>
    </div>
  )
}
