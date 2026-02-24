import { useState, useMemo } from 'react'
import { useEmployees } from '../hooks/useEmployees'
import { useTasks } from '../hooks/useTasks'
import { TIME_INCREMENTS } from '../data/mockData'

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export function WeeklyCalendar({ 
  entries = [], 
  onAdd, 
  onUpdate, 
  onDelete, 
  user, 
  isResponsible 
}) {
  const { employees } = useEmployees()
  const { tasks } = useTasks()
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(today.setDate(diff))
  })
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(
    isResponsible ? '' : user?.id
  )
  const [showModal, setShowModal] = useState(false)
  const [modalData, setModalData] = useState(null)
  const [newTaskId, setNewTaskId] = useState('')
  const [newHours, setNewHours] = useState('')

  const weekDays = useMemo(() => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart)
      d.setDate(d.getDate() + i)
      days.push(d)
    }
    return days
  }, [currentWeekStart])

  const formatDateKey = (date) => date.toISOString().split('T')[0]

  const filteredEntries = useMemo(() => {
    let result = entries
    if (!isResponsible && user) {
      result = entries.filter(e => e.employee_id === user.id)
    } else if (selectedEmployeeId) {
      result = entries.filter(e => e.employee_id === parseInt(selectedEmployeeId))
    }
    return result
  }, [entries, isResponsible, user, selectedEmployeeId])

  const entriesByDay = useMemo(() => {
    const map = {}
    weekDays.forEach(day => {
      const key = formatDateKey(day)
      map[key] = filteredEntries.filter(e => e.date === key)
    })
    return map
  }, [filteredEntries, weekDays])

  const getTaskName = (taskId) => {
    const task = tasks?.find(t => t.id === taskId)
    return task?.name || 'Desconocida'
  }

  const getTaskColor = (taskId) => {
    const colors = {
      1: 'bg-blue-100 border-blue-400 text-blue-800',
      2: 'bg-green-100 border-green-400 text-green-800',
      3: 'bg-yellow-100 border-yellow-400 text-yellow-800',
      4: 'bg-purple-100 border-purple-400 text-purple-800'
    }
    return colors[taskId] || 'bg-gray-100 border-gray-400'
  }

  const prevWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentWeekStart(newDate)
  }

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentWeekStart(newDate)
  }

  const goToToday = () => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1)
    setCurrentWeekStart(new Date(today.setDate(diff)))
  }

  const handleCellClick = (date) => {
    setModalData({ date: formatDateKey(date), type: 'add' })
    setNewTaskId('')
    setNewHours('')
    setShowModal(true)
  }

  const handleEntryClick = (entry, e) => {
    e.stopPropagation()
    setModalData({ ...entry, type: 'edit' })
    setNewTaskId(entry.task_id.toString())
    setNewHours(entry.hours.toString())
    setShowModal(true)
  }

  const handleSave = () => {
    if (!newTaskId || !newHours) return

    if (modalData.type === 'add') {
      onAdd({
        employee_id: isResponsible ? parseInt(selectedEmployeeId) : user.id,
        task_id: parseInt(newTaskId),
        hours: parseFloat(newHours),
        date: modalData.date
      })
    } else {
      onUpdate(modalData.id, {
        task_id: parseInt(newTaskId),
        hours: parseFloat(newHours)
      })
    }
    setShowModal(false)
  }

  const handleDelete = () => {
    if (modalData.type === 'edit') {
      onDelete(modalData.id)
      setShowModal(false)
    }
  }

  const getWeekTotal = () => {
    return Object.values(entriesByDay).flat().reduce((sum, e) => sum + (e.hours || 0), 0)
  }

  const formatDisplayDate = (date) => {
    return `${date.getDate()}`
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="max-w-full">
      <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={prevWeek}
            className="p-2 rounded-lg hover:bg-gray-100 text-xl font-bold"
          >
            ‹
          </button>
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800">
              {DAYS[weekDays[0].getDay() === 0 ? 6 : weekDays[0].getDay() - 1]} {formatDisplayDate(weekDays[0])} - {DAYS[weekDays[6].getDay() === 0 ? 6 : weekDays[6].getDay() - 1]} {formatDisplayDate(weekDays[6])}
            </h2>
            <button
              onClick={goToToday}
              className="text-sm text-blue-600 hover:underline"
            >
              Hoy
            </button>
          </div>
          <button
            onClick={nextWeek}
            className="p-2 rounded-lg hover:bg-gray-100 text-xl font-bold"
          >
            ›
          </button>
        </div>

        {isResponsible && (
          <div className="mb-4">
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg bg-white"
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

        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day, i) => (
                <div 
                  key={i} 
                  className={`
                    text-center p-2 rounded-lg font-semibold
                    ${isToday(day) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}
                  `}
                >
                  <div className="text-xs">{DAYS[i]}</div>
                  <div className="text-lg">{formatDisplayDate(day)}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day, i) => {
                const dateKey = formatDateKey(day)
                const dayEntries = entriesByDay[dateKey] || []
                
                return (
                  <div 
                    key={i}
                    onClick={() => handleCellClick(day)}
                    className={`
                      min-h-[200px] p-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                      ${isToday(day) ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-400'}
                    `}
                  >
                    {dayEntries.map(entry => (
                      <div
                        key={entry.id}
                        onClick={(e) => handleEntryClick(entry, e)}
                        className={`
                          mb-1 p-2 rounded-lg border-l-4 text-sm cursor-pointer hover:opacity-80
                          ${getTaskColor(entry.task_id)}
                        `}
                      >
                        <div className="font-bold">{entry.hours}h</div>
                        <div className="text-xs truncate">{getTaskName(entry.task_id)}</div>
                      </div>
                    ))}
                    {dayEntries.length === 0 && (
                      <div className="text-center text-gray-400 text-sm mt-8">
                        + Añadir
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-100 rounded-lg flex justify-between items-center">
          <span className="text-gray-600">Total semana:</span>
          <span className="text-xl font-bold text-blue-600">{getWeekTotal()} horas</span>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {modalData.type === 'add' ? '➕ Añadir Horas' : '✏️ Editar Horas'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={modalData.date}
                  disabled
                  className="w-full p-3 border rounded-lg bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tarea</label>
                <select
                  value={newTaskId}
                  onChange={(e) => setNewTaskId(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg"
                >
                  <option value="">-- Seleccionar --</option>
                  {(tasks || []).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horas</label>
                <select
                  value={newHours}
                  onChange={(e) => setNewHours(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg"
                >
                  <option value="">-- Seleccionar --</option>
                  {TIME_INCREMENTS.map(h => (
                    <option key={h} value={h}>{h} hora{h > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSave}
                disabled={!newTaskId || !newHours}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold disabled:bg-gray-300"
              >
                Guardar
              </button>
              {modalData.type === 'edit' && (
                <button
                  onClick={handleDelete}
                  className="px-4 bg-red-600 text-white py-3 rounded-lg font-semibold"
                >
                  🗑️
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="px-4 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
