import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Edit2, Archive, ArchiveRestore, Layers } from 'lucide-react'
import { useDepartmentManagement } from '../hooks/useDepartmentManagement'
import { useWorkCenters } from '../hooks/useWorkCenters'
import { DataTable } from './ui/DataTable'
import { DepartmentModal } from './modals/DepartmentModal'
import { ConfirmDialog } from './ui/ConfirmDialog'

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

  // Estado para ConfirmDialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    department: null
  })

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

  const handleRequestToggleActive = (department) => {
    if (department.active) {
      // Pedir confirmación al desactivar
      setConfirmDialog({
        isOpen: true,
        department
      })
    } else {
      // Activar directamente
      executeToggleActive(department)
    }
  }

  const executeToggleActive = async (department) => {
    const result = await toggleActive(department.id)
    if (result.success) {
      toast.success(department.active ? 'Departamento desactivado' : 'Departamento activado')
    } else {
      toast.error(result.error || 'Error al cambiar el estado')
    }
    setConfirmDialog({ isOpen: false, department: null })
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
      className: 'text-right flex items-center justify-end gap-2',
      cell: (row) => (
        <div className="text-right text-sm font-medium flex items-center justify-end gap-3">
          <button
            onClick={() => handleOpenModal(row)}
            className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleRequestToggleActive(row)}
            className={`${row.active ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-50 dark:hover:bg-orange-900/30' : 'text-green-600 hover:text-green-900 hover:bg-green-50 dark:hover:bg-green-900/30'} p-1 rounded-md transition-colors`}
            title={row.active ? 'Desactivar' : 'Activar'}
          >
            {row.active ? <Archive className="w-4 h-4" /> : <ArchiveRestore className="w-4 h-4" />}
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
            <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Departamentos
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gestiona los departamentos por centro de trabajo
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Departamento</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 block">
          Error: {error}
        </div>
      )}

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
        emptyIcon={Layers}
      />

      {/* Modal */}
      <DepartmentModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        department={editingDepartment}
        saving={saving}
      />

      {/* Confirmación para desactivar */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Desactivar Departamento"
        message={`¿Estás seguro de que deseas desactivar el departamento "${confirmDialog.department?.name}"? Afectará a los empleados con este departamento asignado.`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        variant="warning"
        onConfirm={() => executeToggleActive(confirmDialog.department)}
        onCancel={() => setConfirmDialog({ isOpen: false, department: null })}
      />
    </div>
  )
}
