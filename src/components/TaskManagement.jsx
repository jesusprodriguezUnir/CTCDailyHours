import { useState, useEffect } from 'react'
import { useTasks } from '../hooks/useTasks'
import { useCustomers } from '../hooks/useCustomers'

export function TaskManagement() {
  const {
    tasks,
    loading,
    error,
    fetchTasks,
    addTask,
    updateTask,
    toggleTaskActive
  } = useTasks()

  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [taskName, setTaskName] = useState('')
  const [isCustomerService, setIsCustomerService] = useState(false)
  const [customerId, setCustomerId] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [showAll, setShowAll] = useState(true)
  const { customers } = useCustomers()

  // Cargar todas las tareas (incluyendo inactivas)
  useEffect(() => {
    fetchTasks(true)
  }, [fetchTasks])

  const handleOpenModal = (task = null) => {
    setEditingTask(task)
    setTaskName(task?.name || '')
    setIsCustomerService(Boolean(task?.is_customer_service))
    setCustomerId(task?.customer_id ? String(task.customer_id) : '')
    setShowModal(true)
    setMessage(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTask(null)
    setTaskName('')
    setIsCustomerService(false)
    setCustomerId('')
    setMessage(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!taskName.trim()) {
      setMessage({ type: 'error', text: 'El nombre de la tarea es requerido' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      let result
      if (editingTask) {
        result = await updateTask(editingTask.id, {
          name: taskName.trim(),
          is_customer_service: isCustomerService,
          customer_id: isCustomerService && customerId ? parseInt(customerId) : null
        })
      } else {
        result = await addTask({
          name: taskName.trim(),
          is_customer_service: isCustomerService,
          customer_id: isCustomerService && customerId ? parseInt(customerId) : null
        })
      }

      if (result.success) {
        setMessage({
          type: 'success',
          text: editingTask ? 'Tarea actualizada correctamente' : 'Tarea creada correctamente'
        })
        setTimeout(() => {
          handleCloseModal()
        }, 1500)
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al guardar la tarea' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al guardar la tarea' })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (task) => {
    const result = await toggleTaskActive(task.id)
    if (result.success) {
      setMessage({
        type: 'success',
        text: task.active ? 'Tarea desactivada' : 'Tarea activada'
      })
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage({ type: 'error', text: result.error || 'Error al cambiar el estado' })
    }
  }

  const filteredTasks = showAll ? tasks : tasks.filter(t => t.active)

  if (loading && tasks.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">Cargando tareas...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Tareas</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <span>➕</span>
          <span>Nueva Tarea</span>
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

      {/* Filtro */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asistencia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
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
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No hay tareas para mostrar
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{task.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      task.is_customer_service
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {task.is_customer_service ? 'Si' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">
                      {task.customer?.name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      task.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {task.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(task)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleToggleActive(task)}
                      className="text-yellow-600 hover:text-yellow-900 mr-4"
                      title={task.active ? 'Desactivar' : 'Activar'}
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

      {/* Modal para agregar/editar tarea */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
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
                  Nombre de la Tarea
                </label>
                <input
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Clasificación de materiales"
                  disabled={saving}
                  autoFocus
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={isCustomerService}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setIsCustomerService(checked)
                      if (!checked) {
                        setCustomerId('')
                      }
                    }}
                    className="rounded"
                  />
                  Es asistencia al cliente
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cliente (opcional)
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving || !isCustomerService}
                >
                  <option value="">-- Sin cliente --</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
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
