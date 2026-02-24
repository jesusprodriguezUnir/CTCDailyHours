import { useState } from 'react'
import { EmployeeManagement } from './EmployeeManagement'
import { TaskManagement } from './TaskManagement'
import { WorkCenterManagement } from './WorkCenterManagement'
import { DepartmentManagement } from './DepartmentManagement'

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState('employees')

  const tabs = [
    { id: 'employees', label: '👥 Empleados', icon: '👥' },
    { id: 'tasks', label: '📋 Tareas', icon: '📋' },
    { id: 'centers', label: '🏢 Centros', icon: '🏢' },
    { id: 'departments', label: '🏬 Departamentos', icon: '🏬' }
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-md mb-6">
          <div className="px-6 py-4">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <span>⚙️</span>
              <span>Panel de Administración</span>
            </h1>
          </div>

          {/* Tabs Navigation */}
          <div className="border-t border-gray-200">
            <nav className="flex overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow-md rounded-lg">
          {activeTab === 'employees' && <EmployeeManagement />}
          {activeTab === 'tasks' && <TaskManagement />}
          {activeTab === 'centers' && <WorkCenterManagement />}
          {activeTab === 'departments' && <DepartmentManagement />}
        </div>
      </div>
    </div>
  )
}
