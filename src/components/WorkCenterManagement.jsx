import { useState } from 'react'
import { toast } from 'sonner'
import { useWorkCenterManagement } from '../hooks/useWorkCenterManagement'
import { DataTable } from './ui/DataTable'
import { WorkCenterModal } from './modals/WorkCenterModal'

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

  const handleToggleActive = async (center) => {
    const result = await toggleActive(center.id)
    if (result.success) {
      toast.success(center.active ? 'Centro desactivado' : 'Centro activado')
    } else {
      toast.error(result.error || 'Error al cambiar el estado')
    }
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Centros de Trabajo</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gestiona los centros de trabajo de la organización
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          <span>Nuevo Centro</span>
        </button>
      </div>

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
      />

      {/* Modal */}
      <WorkCenterModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        center={editingCenter}
        saving={saving}
      />
    </div>
  )
}
