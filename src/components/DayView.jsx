import { useState, useMemo } from 'react'
import { useEmployees } from '../hooks/useEmployees'
import { useTasks } from '../hooks/useTasks'
import { TIME_INCREMENTS } from '../data/mockData'
import { TimeEntryRow } from './TimeEntryRow'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export function DayView({
  date,
  entries = [],
  onAdd,
  onUpdate,
  onDelete,
  user,
  onBack,
  isResponsible
}) {
  const { employees } = useEmployees()
  const { tasks } = useTasks()
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(
    isResponsible ? '' : user?.id
  )
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTaskId, setNewTaskId] = useState('')
  const [newHours, setNewHours] = useState('')

  const dateObj = new Date(date + 'T00:00:00')
  const dayName = DAYS[dateObj.getDay()]
  const dayNum = dateObj.getDate()
  const monthName = MONTHS[dateObj.getMonth()]

  const employeeMap = useMemo(() => {
    const map = {}
    employees.forEach(emp => { map[emp.id] = emp })
    return map
  }, [employees])

  const filteredEntries = useMemo(() => {
    if (!selectedEmployeeId) return entries
    return entries.filter(e => e.employee_id === parseInt(selectedEmployeeId))
  }, [entries, selectedEmployeeId])

  const totalHours = filteredEntries.reduce((sum, e) => sum + (e.hours || 0), 0)

  const getTaskName = (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    return task?.name || 'Desconocida'
  }

  const handleAdd = () => {
    if (!newTaskId || !newHours) return
    onAdd({
      employee_id: parseInt(selectedEmployeeId),
      task_id: parseInt(newTaskId),
      hours: parseFloat(newHours),
      date: date
    })
    setNewTaskId('')
    setNewHours('')
    setShowAddForm(false)
  }

  const downloadCSV = () => {
    const rows = [['Empleado', 'Tarea', 'Horas']]

    filteredEntries.forEach(entry => {
      const emp = employeeMap[entry.employee_id]
      rows.push([
        emp?.name || 'Desconocido',
        getTaskName(entry.task_id),
        entry.hours
      ])
    })

    rows.push(['TOTAL', '', totalHours])

    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `horas_${date}.csv`
    link.click()
  }

  const canEdit = !isResponsible || (isResponsible && selectedEmployeeId)

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="mb-4 text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 transition-colors"
      >
        ← Volver al calendario
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-4 transition-colors duration-200">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          📅 {dayName} {dayNum} de {monthName}
        </h2>

        {isResponsible && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ver horas de:
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white transition-colors"
            >
              <option value="">-- Seleccionar empleado --</option>
              {employees
                .filter(e => e.role === 'employee')
                .map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        {showAddForm && selectedEmployeeId ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4 transition-colors">
            <h3 className="font-semibold mb-3 dark:text-green-400">➕ Añadir Tarea</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Tarea</label>
                <select
                  value={newTaskId}
                  onChange={(e) => setNewTaskId(e.target.value)}
                  className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white transition-colors"
                >
                  <option value="">-- Seleccionar --</option>
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Horas</label>
                <select
                  value={newHours}
                  onChange={(e) => setNewHours(e.target.value)}
                  className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white transition-colors"
                >
                  <option value="">-- Seleccionar --</option>
                  {TIME_INCREMENTS.map(h => (
                    <option key={h} value={h}>{h} hora{h > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={!newTaskId || !newHours}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold disabled:bg-gray-400 disabled:dark:bg-gray-600 hover:bg-green-700 transition-colors"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        ) : (
          selectedEmployeeId && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold mb-4 hover:bg-green-700"
            >
              ➕ Añadir Tarea
            </button>
          )
        )}

        {filteredEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors">
                <tr>
                  <th className="p-3 text-left font-semibold">Tarea</th>
                  <th className="p-3 text-center font-semibold w-20">Horas</th>
                  <th className="p-3 text-center font-semibold w-16">Editar</th>
                  <th className="p-3 text-center font-semibold w-16">Borrar</th>
                </tr>
              </thead>
              <tbody className="dark:text-gray-200">
                {filteredEntries.map(entry => (
                  <TimeEntryRow
                    key={entry.id}
                    entry={entry}
                    taskName={getTaskName(entry.task_id)}
                    tasks={tasks}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    canEdit={canEdit}
                  />
                ))}
              </tbody>
              <tfoot className="bg-gray-200 dark:bg-gray-900 font-bold dark:text-gray-200 transition-colors">
                <tr>
                  <td className="p-3">TOTAL</td>
                  <td className="p-3 text-center text-lg">{totalHours}</td>
                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No hay horas registradas para este día
          </p>
        )}
      </div>

      {filteredEntries.length > 0 && (
        <button
          onClick={downloadCSV}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          📥 Descargar CSV
        </button>
      )}
    </div>
  )
}
