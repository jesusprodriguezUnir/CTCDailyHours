import { useState } from 'react'
import { toast } from 'sonner'
import { useEmployeeManagement } from '../hooks/useEmployeeManagement'
import { DataTable } from './ui/DataTable'
import { EmployeeModal } from './modals/EmployeeModal'

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

  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleOpenModal = (employee = null) => {
    setEditingEmployee(employee)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingEmployee(null)
  }

  const handleSubmit = async (formData) => {
    setSaving(true)

    try {
      let result
      if (formData.isEditing) {
        // Al editar, solo incluir contraseña si se proporcionó una nueva
        const updates = {
          name: formData.name,
          role: formData.role,
          department_id: formData.department_id
        }
        if (formData.password) {
          updates.password = formData.password
        }
        result = await updateEmployee(formData.id, updates)
      } else {
        result = await addEmployee(
          formData.name,
          formData.role,
          formData.password,
          formData.department_id
        )
      }

      if (result.success) {
        toast.success(formData.isEditing ? 'Empleado actualizado correctamente' : 'Empleado creado correctamente')
        handleCloseModal()
      } else {
        toast.error(result?.error || 'Error al guardar el empleado')
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

  const columns = [
    {
      header: 'Nombre',
      accessorKey: 'name',
      cell: (row) => <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.name}</div>
    },
    {
      header: 'Centro',
      cell: (row) => (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {row.department?.work_center?.name || 'N/A'}
        </div>
      )
    },
    {
      header: 'Departamento',
      cell: (row) => (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {row.department?.name || 'N/A'}
        </div>
      )
    },
    {
      header: 'Rol',
      cell: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full dark:bg-opacity-20 ${getRoleBadgeColor(row.role)}`}>
          {getRoleLabel(row.role)}
        </span>
      )
    },
    {
      header: 'Estado',
      cell: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.active
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}>
          {row.active ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      header: 'Acciones',
      align: 'right',
      className: 'text-right',
      cell: (row) => (
        <div className="text-right text-sm font-medium">
          <button
            onClick={() => handleOpenModal(row)}
            className="text-blue-600 hover:text-blue-900 mr-4"
            title="Editar"
          >
            ✏️
          </button>
          <button
            onClick={() => handleToggleActive(row)}
            className="text-yellow-600 hover:text-yellow-900"
            title={row.active ? 'Desactivar' : 'Activar'}
          >
            🔄
          </button>
        </div>
      )
    }
  ]

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
      <DataTable
        columns={columns}
        data={employees}
        loading={loading}
        emptyMessage="No hay empleados para mostrar"
      />

      {/* Modal para agregar/editar empleado */}
      <EmployeeModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        employee={editingEmployee}
        saving={saving}
      />
    </div>
  )
}
