import { useState } from 'react'
import { toast } from 'sonner'
import { TIME_INCREMENTS } from '../data/mockData'
import { useTimeEntries } from '../hooks/useTimeEntries'
import { useTasks } from '../hooks/useTasks'

export function TimeEntryForm({ user, onBack }) {
  const [taskId, setTaskId] = useState('')
  const [hours, setHours] = useState('')
  const [saving, setSaving] = useState(false)
  const { addEntry } = useTimeEntries(null, null, { enabled: false })
  const { tasks, loading: loadingTasks } = useTasks()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!taskId || !hours) return

    setSaving(true)
    try {
      await addEntry({
        employee_id: user.id,
        task_id: parseInt(taskId),
        hours: parseFloat(hours),
        date: new Date().toISOString().split('T')[0]
      })
      toast.success('Horas registradas correctamente')
      setTaskId('')
      setHours('')
    } catch (err) {
      toast.error('Error al guardar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <button
        onClick={onBack}
        className="mb-4 text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
      >
        ← Cambiar usuario
      </button>

      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
        Registro de Horas
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{user.name}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            Seleccionar Tarea
          </label>
          <select
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            className="w-full p-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-700 dark:text-gray-100 transition-colors"
          >
            <option value="">-- Seleccionar --</option>
            {(tasks || []).map(task => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </select>
          {loadingTasks && (
            <p className="text-sm text-gray-500 mt-2">Cargando tareas...</p>
          )}
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            Horas
          </label>
          <select
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full p-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-700 dark:text-gray-100 transition-colors"
          >
            <option value="">-- Seleccionar --</option>
            {TIME_INCREMENTS.map(h => (
              <option key={h} value={h}>
                {h} hora{h > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={!taskId || !hours || saving}
          className="w-full py-6 px-6 bg-green-600 text-white text-2xl font-bold rounded-xl disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-green-700 active:scale-95 transition-all shadow-lg dark:shadow-none"
        >
          {saving ? 'Guardando...' : 'Registrar Horas'}
        </button>
      </form>
    </div>
  )
}
