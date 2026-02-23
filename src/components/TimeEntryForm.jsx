import { useState } from 'react'
import { TASKS, TIME_INCREMENTS } from '../data/mockData'
import { useTimeEntries } from '../hooks/useTimeEntries'

export function TimeEntryForm({ user, onBack }) {
  const [taskId, setTaskId] = useState('')
  const [hours, setHours] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const { addEntry } = useTimeEntries()

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
      setSuccess(true)
      setTaskId('')
      setHours('')
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      alert('Error al guardar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <button
        onClick={onBack}
        className="mb-4 text-blue-600 hover:underline flex items-center gap-1"
      >
        ← Cambiar usuario
      </button>

      <h2 className="text-xl font-bold text-gray-800 mb-2">
        Registro de Horas
      </h2>
      <p className="text-gray-600 mb-6">{user.name}</p>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 text-center font-semibold">
          ✓ Horas registradas correctamente
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Seleccionar Tarea
          </label>
          <select
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none bg-white"
          >
            <option value="">-- Seleccionar --</option>
            {TASKS.map(task => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Horas
          </label>
          <select
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none bg-white"
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
          className="w-full py-6 px-6 bg-green-600 text-white text-2xl font-bold rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-700 active:scale-95 transition-transform shadow-lg"
        >
          {saving ? 'Guardando...' : 'Registrar Horas'}
        </button>
      </form>
    </div>
  )
}
