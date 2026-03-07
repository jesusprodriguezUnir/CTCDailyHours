import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Edit2, Archive, ArchiveRestore, Building2 } from 'lucide-react'
import { useWorkCenterManagement } from '../hooks/useWorkCenterManagement'
import { DataTable } from './ui/DataTable'
import { WorkCenterModal } from './modals/WorkCenterModal'
import { ConfirmDialog } from './ui/ConfirmDialog'

export function WorkCenterManagement() {
  const {
    workCenters,
    loading,
    error,
    addWorkCenter,
    updateWorkCenterData,
    toggleActive
  } = useWorkCenterManagement()

  const [showModal, setShowModal] = useState(false)
  const [editingCenter, setEditingCenter] = useState(null)
  const [saving, setSaving] = useState(false)
  const [filterActive, setFilterActive] = useState('')

  // Estado para ConfirmDialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    center: null
  })

  const handleOpenModal = (center = null) => {
    setEditingCenter(center)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCenter(null)
  }

  const handleSubmit = async (formData) => {
    setSaving(true)

    try {
      let result
      if (formData.isEditing) {
        result = await updateWorkCenterData(formData.id, {
          name: formData.name,
          code: formData.code
        })
      } else {
        result = await addWorkCenter(
          formData.name,
          formData.code
        )
      }

      if (result.success) {
        toast.success(formData.isEditing ? 'Centro actualizado correctamente' : 'Centro creado correctamente')
        handleCloseModal()
      } else {
        toast.error(result?.error || 'Error al guardar el centro')
      }
    } catch (err) {
      toast.error('Error al guardar el centro')
    } finally {
      setSaving(false)
    }
  }

  const handleRequestToggleActive = (center) => {
    if (center.active) {
      // Pedir confirmación al desactivar
      setConfirmDialog({
        isOpen: true,
        center
      })
    } else {
      // Activar directamente
      executeToggleActive(center)
    }
  }

  const executeToggleActive = async (center) => {
    const result = await toggleActive(center.id)
    if (result.success) {
      toast.success(center.active ? 'Centro desactivado' : 'Centro activado')
    } else {
      toast.error(result.error || 'Error al cambiar el estado')
    }
    setConfirmDialog({ isOpen: false, center: null })
  }

  const filteredCenters = workCenters.filter(center => {
    if (filterActive === '') return true
    return center.active === (filterActive === 'true')
  })

  const columns = [
    {
      header: 'Nombre',
      accessorKey: 'name',
      cell: (row) => <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.name}</div>
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
            <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Centros de Trabajo
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gestiona los centros de trabajo de la organización
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Centro</span>
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
            Estado
          </label>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <DataTable
        columns={columns}
        data={filteredCenters}
        loading={loading}
        emptyMessage="No hay centros de trabajo registrados"
        emptyIcon={Building2}
      />

      {/* Modal */}
      <WorkCenterModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        center={editingCenter}
        saving={saving}
      />

      {/* Confirmación para desactivar */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Desactivar Centro de Trabajo"
        message={`¿Estás seguro de que deseas desactivar el centro "${confirmDialog.center?.name}"? Los empleados y departamentos asociados podrían verse afectados.`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        variant="warning"
        onConfirm={() => executeToggleActive(confirmDialog.center)}
        onCancel={() => setConfirmDialog({ isOpen: false, center: null })}
      />
    </div>
  )
}
