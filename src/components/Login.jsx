import { useState } from 'react'
import { toast } from 'sonner'
import { useEmployees } from '../hooks/useEmployees'

export function Login({ onLogin }) {
  const { employees, loading } = useEmployees()
  const [selectedId, setSelectedId] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!selectedId || !password) {
      toast.error('Selecciona usuario e introduce contraseña')
      return
    }

    const employee = employees.find(emp => emp.id === parseInt(selectedId))

    if (!employee) {
      toast.error('Usuario no encontrado')
      return
    }

    if (employee.password !== password) {
      toast.error('Contraseña incorrecta')
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-200">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🏭</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">CTC Daily Hours</h2>
          <p className="text-gray-600 dark:text-gray-400">Patio de Materiales</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Usuario
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-700 dark:text-gray-100 transition-colors"
            >
              <option value="">-- Seleccionar --</option>
              {employees.map(emp => {
                let badge = ''
                if (emp.role === 'admin') badge = ' 🔴 (Admin)'
                else if (emp.role === 'responsible') badge = ' 🟡 (Responsable)'
                return (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}{badge}
                  </option>
                )
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Introduce tu contraseña"
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white text-xl font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-transform"
          >
            Iniciar Sesión
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm text-gray-600 dark:text-gray-400 transition-colors">
          <p className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Usuarios de prueba:</p>
          <p>• Admin: admin123 (Administrador del sistema)</p>
          <p>• Responsables: nombre123 (ej: pedro123)</p>
          <p>• Empleados: nombre123 (ej: juan123)</p>
        </div>
      </div>
    </div>
  )
}
