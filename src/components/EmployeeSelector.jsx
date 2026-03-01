import { useState } from 'react'
import { useEmployees } from '../hooks/useEmployees'

export function EmployeeSelector({ onSelect }) {
  const { employees, loading, error } = useEmployees()
  const [selectedId, setSelectedId] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedId) return
    const employee = employees.find(emp => emp.id === parseInt(selectedId))
    onSelect(employee)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600 dark:text-gray-400">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
        Selecciona tu usuario
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full p-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none mb-6 bg-white dark:bg-gray-800 dark:text-white transition-colors"
        >
          <option value="">-- Seleccionar --</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.name} {emp.role === 'responsible' ? '(R)' : ''}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={!selectedId}
          className="w-full py-4 px-6 bg-blue-600 text-white text-xl font-bold rounded-xl disabled:bg-gray-300 disabled:dark:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-700 active:scale-95 transition-all"
        >
          Continuar
        </button>
      </form>
    </div>
  )
}
