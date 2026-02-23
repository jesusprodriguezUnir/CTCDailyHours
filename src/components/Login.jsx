import { useState } from 'react'
import { useEmployees } from '../hooks/useEmployees'

export function Login({ onLogin }) {
  const { employees, loading } = useEmployees()
  const [selectedId, setSelectedId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!selectedId || !password) {
      setError('Selecciona usuario e introduce contraseña')
      return
    }

    const employee = employees.find(emp => emp.id === parseInt(selectedId))
    
    if (!employee) {
      setError('Usuario no encontrado')
      return
    }

    if (employee.password !== password) {
      setError('Contraseña incorrecta')
      return
    }

    onLogin(employee)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🏭</div>
          <h2 className="text-2xl font-bold text-gray-800">CTC Daily Hours</h2>
          <p className="text-gray-600">Patio de Materiales</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none bg-white"
            >
              <option value="">-- Seleccionar --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} {emp.role === 'responsible' ? '(Responsable)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Introduce tu contraseña"
              className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white text-xl font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-transform"
          >
            Iniciar Sesión
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
          <p className="font-semibold mb-2">Usuarios de prueba:</p>
          <p>• Empleados: nombre123 (ej: juan123)</p>
          <p>• Responsables: nombre123 (ej: pedro123)</p>
        </div>
      </div>
    </div>
  )
}
