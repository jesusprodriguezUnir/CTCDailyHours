import { useState } from 'react'
import { toast } from 'sonner'
import { useDepartmentManagement } from '../hooks/useDepartmentManagement'
import { useWorkCenters } from '../hooks/useWorkCenters'
import { DataTable } from './ui/DataTable'
import { DepartmentModal } from './modals/DepartmentModal'

export function DepartmentManagement() {
  const [filters, setFilters] = useState({
    work_center_id: '',
    active: ''
  })

  const {
    departments,
    loading,
    error,
    addDepartment,
    updateDepartmentData,
    toggleActive
  } = useDepartmentManagement(filters)

  const { workCenters } = useWorkCenters()

  const [showModal, setShowModal] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleOpenModal = (department = null) => {
    setEditingDepartment(department)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingDepartment(null)
  }

  const handleSubmit = async (formData) => {
    setSaving(true)

    try {
      let result
      if (formData.isEditing) {
        result = await updateDepartmentData(formData.id, {
          name: formData.name,
          code: formData.code,
          work_center_id: formData.work_center_id
        })
      } else {
        result = await addDepartment(
          formData.name,
          formData.code,
          formData.work_center_id
        )
      }

      if (result.success) {
        toast.success(formData.isEditing ? 'Departamento actualizado correctamente' : 'Departamento creado correctamente')
        handleCloseModal()
      } else {
        toast.error(result?.error || 'Error al guardar el departamento')
      }
    } catch (err) {
      toast.error('Error al guardar el departamento')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (department) => {
    const result = await toggleActive(department.id)
    if (result.success) {
      toast.success(department.active ? 'Departamento desactivado' : 'Departamento activado')
    } else {
      toast.error(result.error || 'Error al cambiar el estado')
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const columns = [
    {
      header: 'Centro',
      cell: (row) => (
        <>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {row.work_center?.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {row.work_center?.code}
          </div>
        </>
      )
    },
    {
      header: 'Departamento',
      accessorKey: 'name',
      cell: (row) => <div className="text-sm text-gray-900 dark:text-gray-100">{row.name}</div>
    },
    {
      header: 'Código',
      accessorKey: 'code',
      cell: (row) => <div className="text-sm text-gray-500 dark:text-gray-400">{row.code}</div>
    },
    {
      header: 'Estado',
      cell: (row) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${row.active
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}
        >
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
          >
            ✏️ Editar
          </button>
          <button
            onClick={() => handleToggleActive(row)}
            className={`${row.active ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300' : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
              }`}
          >
            {row.active ? '🚫 Desactivar' : '✅ Activar'}
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Departamentos</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gestiona los departamentos por centro de trabajo
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          <span>Nuevo Departamento</span>
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Centro de Trabajo
          </label>
          <select
            name="work_center_id"
            value={filters.work_center_id}
            onChange={handleFilterChange}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option value="">Todos</option>
            {workCenters.map(center => (
              <option key={center.id} value={center.id}>
                {center.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estado
          </label>
          <select
            name="active"
            value={filters.active}
            onChange={handleFilterChange}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={departments}
        loading={loading}
        emptyMessage="No hay departamentos registrados con los filtros seleccionados"
      />

      {/* Modal */}
      <DepartmentModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        department={editingDepartment}
        saving={saving}
      />
    </div>
  )
}
