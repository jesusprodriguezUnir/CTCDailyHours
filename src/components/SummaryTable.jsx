import { useState, useMemo, useEffect } from 'react'
import { useTimeEntries } from '../hooks/useTimeEntries'
import { useEmployees } from '../hooks/useEmployees'
import { useTasks } from '../hooks/useTasks'
import { useWorkCenters } from '../hooks/useWorkCenters'
import { useDepartments } from '../hooks/useDepartments'
import { 
  exportToExcel, 
  exportToPDF, 
  exportToCSV,
  groupByEmployeeForExport,
  groupByTaskForExport,
  groupByPeriodForExport,
  formatTimeEntriesForExport
} from '../utils/exportHelpers'

export function SummaryTable({ user, isResponsible, isAdmin }) {
  const { entries, loading: loadingEntries } = useTimeEntries(null, user)
  const { employees, loading: loadingEmployees } = useEmployees()
  const { tasks, loading: loadingTasks } = useTasks()
  const { workCenters, loading: loadingCenters } = useWorkCenters()
  const { departments, loading: loadingDepartments } = useDepartments()
  
  const [viewMode, setViewMode] = useState('employee') // 'employee', 'task', 'period'
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [selectedTasks, setSelectedTasks] = useState([])
  const [selectedCenters, setSelectedCenters] = useState([])
  const [selectedDepartments, setSelectedDepartments] = useState([])
  const [message, setMessage] = useState(null)

  // Inicializar fechas con el mes actual
  useEffect(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    setDateRange({
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0]
    })
  }, [])

  // Filtrar entradas según criterios
  const filteredEntries = useMemo(() => {
    let filtered = entries

    // 🔒 SEGURIDAD: Si es empleado regular, solo puede ver sus propias entradas
    if (user && !isResponsible && !isAdmin) {
      filtered = filtered.filter(e => e.employee_id === user.id)
    }

    // Filtrar por rango de fechas
    if (dateRange.start) {
      filtered = filtered.filter(e => e.date >= dateRange.start)
    }
    if (dateRange.end) {
      filtered = filtered.filter(e => e.date <= dateRange.end)
    }

    // Filtrar por empleados seleccionados
    if (selectedEmployees.length > 0) {
      filtered = filtered.filter(e => selectedEmployees.includes(e.employee_id))
    }

    // Filtrar por tareas seleccionadas
    if (selectedTasks.length > 0) {
      filtered = filtered.filter(e => selectedTasks.includes(e.task_id))
    }

    // Filtrar por centros de trabajo
    if (selectedCenters.length > 0) {
      filtered = filtered.filter(e => {
        const centerId = e.employee?.department?.work_center?.id
        return centerId && selectedCenters.includes(centerId)
      })
    }

    // Filtrar por departamentos
    if (selectedDepartments.length > 0) {
      filtered = filtered.filter(e => {
        const departmentId = e.employee?.department?.id
        return departmentId && selectedDepartments.includes(departmentId)
      })
    }

    return filtered
  }, [entries, dateRange, selectedEmployees, selectedTasks, selectedCenters, selectedDepartments, user, isResponsible, isAdmin])

  // Enriquecer entradas con información de empleado y tarea
  const enrichedEntries = useMemo(() => {
    return filteredEntries.map(entry => ({
      ...entry,
      employee: entry.employee || employees.find(e => e.id === entry.employee_id),
      task: entry.task || tasks.find(t => t.id === entry.task_id)
    }))
  }, [filteredEntries, employees, tasks])

  // Calcular resumen según modo de vista
  const summary = useMemo(() => {
    if (viewMode === 'employee') {
      return groupByEmployeeForExport(enrichedEntries, tasks)
    } else if (viewMode === 'task') {
      return groupByTaskForExport(enrichedEntries, employees)
    } else {
      return groupByPeriodForExport(enrichedEntries)
    }
  }, [enrichedEntries, viewMode, employees, tasks])

  const handleExport = (format) => {
    try {
      setMessage(null)
      
      const dateStr = new Date().toISOString().split('T')[0]
      const filename = `reporte_horas_${dateStr}`
      let result

      const viewTitles = {
        employee: 'Reporte de Horas por Empleado',
        task: 'Reporte de Horas por Tarea',
        period: 'Reporte de Horas por Período'
      }

      if (format === 'excel') {
        result = exportToExcel(summary, filename, viewTitles[viewMode])
      } else if (format === 'pdf') {
        const totalHours = summary.reduce((sum, row) => sum + (row['Total Horas'] || 0), 0)
        result = exportToPDF(summary, filename, viewTitles[viewMode], {
          orientation: 'landscape',
          totals: {
            'Total General de Horas': totalHours.toFixed(2)
          }
        })
      } else if (format === 'csv') {
        result = exportToCSV(summary, filename)
      }

      if (result.success) {
        setMessage({ type: 'success', text: `Reporte exportado correctamente a ${format.toUpperCase()}` })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al exportar' })
      }
    } catch (error) {
      console.error('Error al exportar:', error)
      setMessage({ type: 'error', text: 'Error al exportar el reporte' })
    }
  }

  const toggleEmployee = (empId) => {
    setSelectedEmployees(prev =>
      prev.includes(empId)
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    )
  }

  const toggleTask = (taskId) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const totalHours = useMemo(() => {
    return summary.reduce((sum, row) => sum + (row['Total Horas'] || 0), 0)
  }, [summary])

  const loading = loadingEntries || loadingEmployees || loadingTasks || loadingCenters || loadingDepartments

  const visibleDepartments = selectedCenters.length > 0
    ? departments.filter(dept => selectedCenters.includes(dept.work_center_id))
    : departments

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600">Cargando datos...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Reportes y Resumen</h2>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Filtros</h3>
        
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
          (isResponsible || isAdmin) ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
        }`}>
          {/* Rango de fechas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro de empleados - Solo para Admin y Responsable */}
          {(isResponsible || isAdmin) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empleados ({selectedEmployees.length > 0 ? selectedEmployees.length : 'Todos'})
              </label>
              <select
                multiple
                value={selectedEmployees}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => parseInt(option.value))
                  setSelectedEmployees(values)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                size="1"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Filtro de tareas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tareas ({selectedTasks.length > 0 ? selectedTasks.length : 'Todas'})
            </label>
            <select
              multiple
              value={selectedTasks}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => parseInt(option.value))
                setSelectedTasks(values)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              size="5"
            >
              {tasks.map(task => (
                <option key={task.id} value={task.id}>{task.name}</option>
              ))}
            </select>
          </div>

          {/* Filtro de centros */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Centros ({selectedCenters.length > 0 ? selectedCenters.length : 'Todos'})
            </label>
            <select
              multiple
              value={selectedCenters}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => parseInt(option.value))
                setSelectedCenters(values)
                if (values.length === 0) {
                  setSelectedDepartments([])
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              size="4"
            >
              {workCenters.map(center => (
                <option key={center.id} value={center.id}>{center.name}</option>
              ))}
            </select>
          </div>

          {/* Filtro de departamentos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departamentos ({selectedDepartments.length > 0 ? selectedDepartments.length : 'Todos'})
            </label>
            <select
              multiple
              value={selectedDepartments}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => parseInt(option.value))
                setSelectedDepartments(values)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              size="6"
            >
              {visibleDepartments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.work_center?.name ? `${dept.work_center.name} - ` : ''}{dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botones de limpiar filtros */}
        <div className="mt-3 flex gap-2">
          {(isResponsible || isAdmin) && selectedEmployees.length > 0 && (
            <button
              onClick={() => setSelectedEmployees([])}
              className="text-sm text-blue-600 hover:underline"
            >
              Limpiar empleados
            </button>
          )}
          {selectedTasks.length > 0 && (
            <button
              onClick={() => setSelectedTasks([])}
              className="text-sm text-blue-600 hover:underline"
            >
              Limpiar tareas
            </button>
          )}
          {selectedCenters.length > 0 && (
            <button
              onClick={() => {
                setSelectedCenters([])
                setSelectedDepartments([])
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Limpiar centros
            </button>
          )}
          {selectedDepartments.length > 0 && (
            <button
              onClick={() => setSelectedDepartments([])}
              className="text-sm text-blue-600 hover:underline"
            >
              Limpiar departamentos
            </button>
          )}
        </div>
      </div>

      {/* Modo de vista */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('employee')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'employee'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Por Empleado
            </button>
            <button
              onClick={() => setViewMode('task')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'task'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Por Tarea
            </button>
            <button
              onClick={() => setViewMode('period')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'period'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Por Período
            </button>
          </div>

          {/* Botones de exportación */}
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('excel')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              title="Exportar a Excel"
            >
              <span>📊</span>
              <span>Excel</span>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              title="Exportar a PDF"
            >
              <span>📑</span>
              <span>PDF</span>
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              title="Exportar a CSV"
            >
              <span>📄</span>
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de resumen */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {summary.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay datos para mostrar con los filtros seleccionados
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(summary[0]).map((key, index) => (
                      <th
                        key={index}
                        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                          key.includes('Total') ? 'bg-gray-100' : ''
                        }`}
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {summary.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {Object.values(row).map((value, colIndex) => (
                        <td
                          key={colIndex}
                          className={`px-6 py-4 whitespace-nowrap text-sm ${
                            typeof value === 'number' ? 'text-right font-medium' : 'text-gray-900'
                          }`}
                        >
                          {typeof value === 'number' ? value.toFixed(2) : value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 font-bold">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      TOTAL GENERAL
                    </td>
                    <td
                      colSpan={Object.keys(summary[0]).length - 1}
                      className="px-6 py-4 text-right text-sm text-gray-900"
                    >
                      {totalHours.toFixed(2)} horas
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Información adicional */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{filteredEntries.length}</span> registros encontrados
                {dateRange.start && dateRange.end && (
                  <span className="ml-4">
                    del {new Date(dateRange.start).toLocaleDateString('es-ES')} al {new Date(dateRange.end).toLocaleDateString('es-ES')}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
