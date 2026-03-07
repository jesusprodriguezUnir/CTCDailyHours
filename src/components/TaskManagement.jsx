import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Edit2, Archive, ArchiveRestore, ClipboardList } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import { DataTable } from './ui/DataTable'
import { TaskModal } from './modals/TaskModal'
import { ConfirmDialog } from './ui/ConfirmDialog'

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

  // Estado para ConfirmDialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    task: null
  })

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

  const handleRequestToggleActive = (task) => {
    if (task.active) {
      // Pedir confirmación al desactivar
      setConfirmDialog({
        isOpen: true,
        task
      })
    } else {
      // Activar directamente
      executeToggleActive(task)
    }
  }

  const executeToggleActive = async (task) => {
    const result = await toggleTaskActive(task.id)
    if (result.success) {
      toast.success(task.active ? 'Tarea desactivada' : 'Tarea activada')
    } else {
      toast.error(result.error || 'Error al cambiar el estado')
    }
    setConfirmDialog({ isOpen: false, task: null })
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Gestión de Tareas
        </h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Tarea</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 block">
          Error: {error}
        </div>
      )}

      {/* Filtro */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer w-max">
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
          />
          Mostrar tareas inactivas
        </label>
      </div>

      {/* Tabla de tareas */}
      <DataTable
        columns={columns}
        data={filteredTasks}
        loading={loading}
        emptyMessage="No hay tareas registradas"
        emptyIcon={ClipboardList}
      />

      {/* Modal para agregar/editar tarea */}
      <TaskModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        task={editingTask}
        saving={saving}
      />

      {/* Confirmación para desactivar */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Desactivar Tarea"
        message={`¿Estás seguro de que deseas archivar la tarea "${confirmDialog.task?.name}"? Ya no aparecerá en las partes de horas diarios de los operarios.`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        variant="warning"
        onConfirm={() => executeToggleActive(confirmDialog.task)}
        onCancel={() => setConfirmDialog({ isOpen: false, task: null })}
      />
    </div>
  )
}

