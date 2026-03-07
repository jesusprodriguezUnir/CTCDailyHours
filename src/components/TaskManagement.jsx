import { useState } from 'react'
import { toast } from 'sonner'
import { useTasks } from '../hooks/useTasks'
import { DataTable } from './ui/DataTable'
import { TaskModal } from './modals/TaskModal'

export function TaskManagement() {
  const {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    toggleTaskActive
  } = useTasks(true) // includeInactive = true para el panel de administración

  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showAll, setShowAll] = useState(true)

  const handleOpenModal = (task = null) => {
    setEditingTask(task)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTask(null)
  }

  const handleSubmit = async (formData) => {
    setSaving(true)

    try {
      let result
      if (formData.isEditing) {
        result = await updateTask(formData.id, {
          name: formData.name,
          is_customer_service: formData.is_customer_service,
          customer_id: formData.customer_id
        })
      } else {
        result = await addTask({
          name: formData.name,
          is_customer_service: formData.is_customer_service,
          customer_id: formData.customer_id
        })
      }

      if (result.success) {
        toast.success(formData.isEditing ? 'Tarea actualizada correctamente' : 'Tarea creada correctamente')
        handleCloseModal()
      } else {
        toast.error(result?.error || 'Error al guardar la tarea')
      }
    } catch (err) {
      toast.error('Error al guardar la tarea')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (task) => {
    const result = await toggleTaskActive(task.id)
    if (result.success) {
      toast.success(task.active ? 'Tarea desactivada' : 'Tarea activada')
    } else {
      toast.error(result.error || 'Error al cambiar el estado')
    }
  }

  const filteredTasks = showAll ? tasks : tasks.filter(t => t.active)

  const columns = [
    {
      header: 'Nombre',
      accessorKey: 'name',
      cell: (row) => <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.name}</div>
    },
    {
      header: 'Asistencia',
      cell: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.is_customer_service
          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}>
          {row.is_customer_service ? 'Si' : 'No'}
        </span>
      )
    },
    {
      header: 'Cliente',
      cell: (row) => (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {row.customer?.name || 'N/A'}
        </div>
      )
    },
    {
      header: 'Estado',
      cell: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.active
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}>
          {row.active ? 'Activa' : 'Inactiva'}
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
            className="text-yellow-600 hover:text-yellow-900 mr-4"
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
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Gestión de Tareas</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <span>➕</span>
          <span>Nueva Tarea</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
          Error: {error}
        </div>
      )}

      {/* Filtro */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
            className="rounded"
          />
          Mostrar tareas inactivas
        </label>
      </div>

      {/* Tabla de tareas */}
      <DataTable
        columns={columns}
        data={filteredTasks}
        loading={loading}
        emptyMessage="No hay tareas para mostrar"
      />

      {/* Modal para agregar/editar tarea */}
      <TaskModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        task={editingTask}
        saving={saving}
      />
    </div>
  )
}

