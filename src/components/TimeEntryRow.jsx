import { useState } from 'react'
import { TIME_INCREMENTS } from '../data/mockData'

export function TimeEntryRow({ entry, taskName, tasks, onUpdate, onDelete, canEdit }) {
  const [editing, setEditing] = useState(false)
  const [hours, setHours] = useState(entry.hours)
  const [taskId, setTaskId] = useState(entry.task_id)

  const handleSave = () => {
    onUpdate(entry.id, { hours: parseFloat(hours), task_id: parseInt(taskId) })
    setEditing(false)
  }

  const handleCancel = () => {
    setHours(entry.hours)
    setTaskId(entry.task_id)
    setEditing(false)
  }

  if (editing && canEdit) {
    return (
      <tr className="border-b dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/20 transition-colors">
        <td className="p-3">
          <select
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            className="w-full p-2 border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white transition-colors"
          >
            {tasks.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </td>
        <td className="p-3">
          <select
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full p-2 border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white transition-colors"
          >
            {TIME_INCREMENTS.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </td>
        <td className="p-3 text-center">
          <button
            onClick={handleSave}
            className="text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 p-1 rounded mr-1 transition-colors"
          >
            ✓
          </button>
          <button
            onClick={handleCancel}
            className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 p-1 rounded transition-colors"
          >
            ✕
          </button>
        </td>
        <td className="p-3"></td>
      </tr>
    )
  }

  return (
    <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <td className="p-3 font-medium">{taskName}</td>
      <td className="p-3 text-center font-semibold">{entry.hours}</td>
      <td className="p-3 text-center">
        {canEdit && (
          <button
            onClick={() => setEditing(true)}
            className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 p-2 rounded transition-colors"
            title="Editar"
          >
            ✏️
          </button>
        )}
      </td>
      <td className="p-3 text-center">
        {canEdit && (
          <button
            onClick={() => onDelete(entry.id)}
            className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 p-2 rounded transition-colors"
            title="Borrar"
          >
            🗑️
          </button>
        )}
      </td>
    </tr>
  )
}
