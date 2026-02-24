import { useState, useEffect } from 'react'
import { useEmployeeManagement } from '../hooks/useEmployeeManagement'

export function EmployeeManagement() {
  const {
    loading,
    error,
    addEmployee,
    updateEmployee,
    toggleEmployeeActive,
    fetchEmployees
  } = useEmployeeManagement()

  const [employees, setEmployees] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    role: 'employee',
    password: ''
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [filters, setFilters] = useState({
    role: '',
    active: ''
  })

  // Cargar empleados al montar
  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    const result = await fetchEmployees()
    if (result.success) {
      setEmployees(result.data)
    }
  }

  const handleOpenModal = (employee = null) => {
    setEditingEmployee(employee)
    setFormData({
      name: employee?.name || '',
      role: employee?.role || 'employee',
      password: '' // No mostrar contraseña actual
    })
    setShowModal(true)
    setMessage(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingEmployee(null)
    setFormData({ name: '', role: 'employee', password: '' })
    setMessage(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'El nombre es requerido' })
      return
    }

    if (!editingEmployee && !formData.password) {
      setMessage({ type: 'error', text: 'La contraseña es requerida para nuevos empleados' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      let result
      if (editingEmployee) {
        // Al editar, solo incluir contraseña si se proporcionó una nueva
        const updates = {
          name: formData.name.trim(),
          role: formData.role
        }
        if (formData.password) {
          updates.password = formData.password
        }
        result = await updateEmployee(editingEmployee.id, updates)
      } else {
        result = await addEmployee(formData.name.trim(), formData.role, formData.password)
      }

      if (result.success) {
        setMessage({
          type: 'success',
          text: editingEmployee ? 'Empleado actualizado correctamente' : 'Empleado creado correctamente'
        })
        await loadEmployees()
        setTimeout(() => {
          handleCloseModal()
        }, 1500)
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al guardar el empleado' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al guardar el empleado' })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (employee) => {
    const result = await toggleEmployeeActive(employee.id)
    if (result.success) {
      setMessage({
        type: 'success',
        text: employee.active ? 'Empleado desactivado' : 'Empleado activado'
      })
      await loadEmployees()
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage({ type: 'error', text: result.error || 'Error al cambiar el estado' })
    }
  }

  const handleFilterChange = async (e) => {
    const { name, value } = e.target
    const newFilters = { ...filters, [name]: value }
    setFilters(newFilters)

    // Aplicar filtros
    const filterObj = {}
    if (newFilters.role) filterObj.role = newFilters.role
    if (newFilters.active !== '') filterObj.active = newFilters.active === 'true'

    const result = await fetchEmployees(filterObj)
    if (result.success) {
      setEmployees(result.data)
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'responsible': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrador'
      case 'responsible': return 'Responsable'
      default: return 'Empleado'
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Empleados</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <span>➕</span>
          <span>Nuevo Empleado</span>
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-100 text-red-800">
          Error: {error}
        </div>
      )}

      {/* Filtros */}
      <div className="mb-4 flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
          <select
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="admin">Administrador</option>
            <option value="responsible">Responsable</option>
            <option value="employee">Empleado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            name="active"
            value={filters.active}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Tabla de empleados */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && employees.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  Cargando empleados...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No hay empleados para mostrar
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(employee.role)}`}>
                      {getRoleLabel(employee.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      employee.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {employee.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(employee)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleToggleActive(employee)}
                      className="text-yellow-600 hover:text-yellow-900"
                      title={employee.active ? 'Desactivar' : 'Activar'}
                    >
                      🔄
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para agregar/editar empleado */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
            </h3>

            {message && (
              <div className={`mb-4 p-3 rounded ${
                message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Juan Pérez García"
                  disabled={saving}
                  autoFocus
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                >
                  <option value="employee">Empleado</option>
                  <option value="responsible">Responsable</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña {editingEmployee && '(dejar en blanco para no cambiar)'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={editingEmployee ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                  disabled={saving}
                />
                {!editingEmployee && (
                  <p className="text-xs text-gray-500 mt-1">Mínimo 4 caracteres</p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
