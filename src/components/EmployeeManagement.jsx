import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useEmployeeManagement } from '../hooks/useEmployeeManagement'
import { useDepartments } from '../hooks/useDepartments'

function getPasswordStrength(password) {
  if (!password) return null
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasDigit = /\d/.test(password)
  const hasSpecial = /[^a-zA-Z0-9]/.test(password)
  const variety = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length
  if (password.length < 4) return { label: 'Muy débil', barColor: 'bg-red-500', textColor: 'text-red-500', width: 'w-1/4' }
  if (password.length < 8 || variety < 2) return { label: 'Débil', barColor: 'bg-orange-400', textColor: 'text-orange-400', width: 'w-2/4' }
  if (password.length < 12 || variety < 3) return { label: 'Media', barColor: 'bg-yellow-400', textColor: 'text-yellow-500', width: 'w-3/4' }
  return { label: 'Fuerte', barColor: 'bg-green-500', textColor: 'text-green-600', width: 'w-full' }
}

function PasswordStrengthIndicator({ password }) {
  const strength = getPasswordStrength(password)
  if (!strength) return null
  return (
    <div className="mt-1">
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${strength.barColor} ${strength.width}`} />
      </div>
      <p className={`text-xs mt-0.5 ${strength.textColor}`}>{strength.label}</p>
    </div>
  )
}

export function EmployeeManagement() {
  const [filters, setFilters] = useState({
    role: '',
    active: ''
  })

  const {
    employees,
    loading,
    error,
    addEmployee,
    updateEmployee,
    toggleEmployeeActive
  } = useEmployeeManagement(filters)

  const { departments } = useDepartments()

  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    role: 'employee',
    password: '',
    department_id: null
  })
  const [saving, setSaving] = useState(false)

  const handleOpenModal = (employee = null) => {
    setEditingEmployee(employee)
    setFormData({
      name: employee?.name || '',
      role: employee?.role || 'employee',
      password: '', // No mostrar contraseña actual
      department_id: employee?.department_id || employee?.department?.id || ''
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingEmployee(null)
    setFormData({ name: '', role: 'employee', password: '', department_id: '' })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    if (!editingEmployee && !formData.password) {
      toast.error('La contraseña es requerida para nuevos empleados')
      return
    }

    if (!formData.department_id) {
      toast.error('El departamento es requerido')
      return
    }

    setSaving(true)

    try {
      let result
      if (editingEmployee) {
        // Al editar, solo incluir contraseña si se proporcionó una nueva
        const updates = {
          name: formData.name.trim(),
          role: formData.role,
          department_id: parseInt(formData.department_id)
        }
        if (formData.password) {
          updates.password = formData.password
        }
        result = await updateEmployee(editingEmployee.id, updates)
      } else {
        result = await addEmployee(
          formData.name.trim(),
          formData.role,
          formData.password,
          parseInt(formData.department_id)
        )
      }

      if (result.success) {
        toast.success(editingEmployee ? 'Empleado actualizado correctamente' : 'Empleado creado correctamente')
        handleCloseModal()
      } else {
        toast.error(result.error || 'Error al guardar el empleado')
      }
    } catch (err) {
      toast.error('Error al guardar el empleado')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (employee) => {
    const result = await toggleEmployeeActive(employee.id)
    if (result.success) {
      toast.success(employee.active ? 'Empleado desactivado' : 'Empleado activado')
    } else {
      toast.error(result.error || 'Error al cambiar el estado')
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
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
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Gestión de Empleados</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <span>➕</span>
          <span>Nuevo Empleado</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
          Error: {error}
        </div>
      )}

      {/* Filtros */}
      <div className="mb-4 flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
          <select
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
          >
            <option value="">Todos</option>
            <option value="admin">Administrador</option>
            <option value="responsible">Responsable</option>
            <option value="employee">Empleado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
          <select
            name="active"
            value={filters.active}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Tabla de empleados */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-colors">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900 transition-colors">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Centro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Departamento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors">
            {loading && employees.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  Cargando empleados...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No hay empleados para mostrar
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{employee.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {employee.department?.work_center?.name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {employee.department?.name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full dark:bg-opacity-20 ${getRoleBadgeColor(employee.role)}`}>
                      {getRoleLabel(employee.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md transition-colors">
            <h3 className="text-xl font-bold mb-4 dark:text-white">
              {editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="Ej: Juan Pérez García"
                  disabled={saving}
                  autoFocus
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Departamento
                </label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
                  disabled={saving}
                >
                  <option value="">-- Seleccionar --</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.work_center?.name ? `${dept.work_center.name} - ` : ''}{dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rol
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
                  disabled={saving}
                >
                  <option value="employee">Empleado</option>
                  <option value="responsible">Responsable</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contraseña {editingEmployee && '(dejar en blanco para no cambiar)'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder={editingEmployee ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                  disabled={saving}
                  autoComplete="new-password"
                />
                {formData.password && (
                  <PasswordStrengthIndicator password={formData.password} />
                )}
                {!editingEmployee && !formData.password && (
                  <p className="text-xs text-gray-500 mt-1">Mínimo 4 caracteres</p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
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
