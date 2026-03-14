import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
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

  const [viewMode, setViewMode] = useState('detail') // 'detail', 'employee', 'task', 'period'
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [selectedTasks, setSelectedTasks] = useState([])
  const [selectedCenters, setSelectedCenters] = useState([])
  const [selectedDepartments, setSelectedDepartments] = useState([])

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
  // Prioritize data from the employees list since it always includes the full
  // department and work_center joins required for export fields
  const enrichedEntries = useMemo(() => {
    return filteredEntries.map(entry => {
      const employeeWithJoins = employees.find(e => e.id === entry.employee_id)
      return {
        ...entry,
        employee: employeeWithJoins || entry.employee,
        task: entry.task || tasks.find(t => t.id === entry.task_id)
      }
    })
  }, [filteredEntries, employees, tasks])

  // Calcular resumen según modo de vista (solo para vistas agrupadas)
  const summary = useMemo(() => {
    if (viewMode === 'employee') {
      return groupByEmployeeForExport(enrichedEntries, tasks)
    } else if (viewMode === 'task') {
      return groupByTaskForExport(enrichedEntries, employees)
    } else if (viewMode === 'period') {
      return groupByPeriodForExport(enrichedEntries)
    } else {
      return [] // 'detail' usa paginatedEntries
    }
  }, [enrichedEntries, viewMode, employees, tasks])

  // Datos detallados para tabla y exportación
  const detailData = useMemo(() => {
    return formatTimeEntriesForExport(enrichedEntries)
  }, [enrichedEntries])

  // Datos paginados para vista detalle
  const paginatedEntries = useMemo(() => {
    if (viewMode !== 'detail') return []
    const startIndex = (currentPage - 1) * itemsPerPage
    return detailData.slice(startIndex, startIndex + itemsPerPage)
  }, [detailData, viewMode, currentPage, itemsPerPage])

  const totalPages = Math.ceil(detailData.length / itemsPerPage)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [dateRange, selectedEmployees, selectedTasks, selectedCenters, selectedDepartments, viewMode])


  const handleExport = (format) => {
    try {
      const dateStr = new Date().toISOString().split('T')[0]
      const filename = `reporte_horas_${dateStr}`
      let result

      const viewTitles = {
        detail: 'Reporte Detallado de Horas',
        employee: 'Reporte de Horas por Empleado',
        task: 'Reporte de Horas por Tarea',
        period: 'Reporte de Horas por Período'
      }

      const exportData = viewMode === 'detail' ? detailData : summary

      if (exportData.length === 0) {
        toast.error('No hay datos para exportar')
        return
      }

      if (format === 'excel') {
        result = exportToExcel(exportData, filename, viewTitles[viewMode])
      } else if (format === 'pdf') {
        const totalHours = exportData.reduce((sum, row) => sum + (parseFloat(row['Total Horas'] || row['Horas']) || 0), 0)
        result = exportToPDF(exportData, filename, viewTitles[viewMode], {
          orientation: 'landscape',
          totals: {
            'Total General de Horas': totalHours.toFixed(2)
          }
        })
      } else if (format === 'csv') {
        result = exportToCSV(exportData, filename)
      }

      if (result.success) {
        toast.success(`Reporte exportado correctamente a ${format.toUpperCase()}`)
      } else {
        toast.error(result.error || 'Error al exportar')
      }
    } catch (error) {
      console.error('Error al exportar:', error)
      toast.error('Error al exportar el reporte')
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
    const dataToSum = viewMode === 'detail' ? detailData : summary;
    return dataToSum.reduce((sum, row) => sum + (parseFloat(row['Total Horas'] || row['Horas']) || 0), 0)
  }, [summary, detailData, viewMode])

  const loading = loadingEntries || loadingEmployees || loadingTasks || loadingCenters || loadingDepartments

  const visibleDepartments = selectedCenters.length > 0
    ? departments.filter(dept => selectedCenters.includes(dept.work_center_id))
    : departments

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-600 dark:text-gray-400">Cargando datos...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">📊 Reportes y Resumen</h2>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 transition-colors">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Filtros</h3>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${(isResponsible || isAdmin) ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
          }`}>
          {/* Rango de fechas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Inicio</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Fin</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
            />
          </div>

          {/* Filtro de empleados - Solo para Admin y Responsable */}
          {(isResponsible || isAdmin) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Empleados ({selectedEmployees.length > 0 ? selectedEmployees.length : 'Todos'})
              </label>
              <select
                multiple
                value={selectedEmployees}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => parseInt(option.value))
                  setSelectedEmployees(values)
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tareas ({selectedTasks.length > 0 ? selectedTasks.length : 'Todas'})
            </label>
            <select
              multiple
              value={selectedTasks}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => parseInt(option.value))
                setSelectedTasks(values)
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
              size="5"
            >
              {tasks.map(task => (
                <option key={task.id} value={task.id}>{task.name}</option>
              ))}
            </select>
          </div>

          {/* Filtro de centros */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Centros ({selectedCenters.length > 0 ? selectedCenters.length : 'Todos'})
            </label>
            <select
              multiple
              value={selectedCenters}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => parseInt(option.value))
                setSelectedCenters(values)
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
              size="4"
            >
              {workCenters.map(center => (
                <option key={center.id} value={center.id}>{center.name}</option>
              ))}
            </select>
          </div>

          {/* Filtro de departamentos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Departamentos ({selectedDepartments.length > 0 ? selectedDepartments.length : 'Todos'})
            </label>
            <select
              multiple
              value={selectedDepartments}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => parseInt(option.value))
                setSelectedDepartments(values)
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
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
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Limpiar empleados
            </button>
          )}
          {selectedTasks.length > 0 && (
            <button
              onClick={() => setSelectedTasks([])}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
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
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Limpiar centros
            </button>
          )}
          {selectedDepartments.length > 0 && (
            <button
              onClick={() => setSelectedDepartments([])}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Limpiar departamentos
            </button>
          )}
        </div>
      </div>

      {/* Modo de vista */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 transition-colors">
        <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setViewMode('detail')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'detail'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              Detallado
            </button>
            <button
              onClick={() => setViewMode('employee')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'employee'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              Por Empleado
            </button>
            <button
              onClick={() => setViewMode('task')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'task'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              Por Tarea
            </button>
            <button
              onClick={() => setViewMode('period')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'period'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
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

      {/* Tabla de resumen o detalles */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col transition-colors">
        {(viewMode === 'detail' ? detailData.length === 0 : summary.length === 0) ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No hay datos para mostrar con los filtros seleccionados
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900 transition-colors">
                  <tr>
                    {Object.keys(viewMode === 'detail' ? detailData[0] : summary[0]).map((key, index) => (
                      <th
                        key={index}
                        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${key.includes('Total') || key === 'Horas' ? 'bg-gray-100 dark:bg-gray-700 text-right' : ''
                          }`}
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors">
                  {(viewMode === 'detail' ? paginatedEntries : summary).map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      {Object.entries(row).map(([key, value], colIndex) => {
                        const isNumeric = typeof value === 'number' || (!isNaN(parseFloat(value)) && (key.includes('Total') || key === 'Horas'));
                        return (
                          <td
                            key={colIndex}
                            className={`px-6 py-4 whitespace-nowrap text-sm ${isNumeric ? 'text-right font-medium text-gray-900 dark:text-white' : 'text-gray-900 dark:text-gray-200'
                              }`}
                          >
                            {isNumeric ? parseFloat(value).toFixed(2) : value}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 dark:bg-gray-900 font-bold transition-colors">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white" colSpan={
                      viewMode === 'detail'
                        ? (detailData.length > 0 ? Object.keys(detailData[0]).length - 1 : 1)
                        : (summary.length > 0 ? Object.keys(summary[0]).length - 1 : 1)
                    }>
                      TOTAL GENERAL
                    </td>
                    <td
                      className="px-6 py-4 text-right text-sm text-gray-900 dark:text-white"
                    >
                      {totalHours.toFixed(2)} horas
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Paginación - solo para vista detallada */}
            {viewMode === 'detail' && detailData.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Mostrar
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:text-white"
                  >
                    {[10, 25, 50, 100].map(limit => (
                      <option key={limit} value={limit}>{limit}</option>
                    ))}
                  </select>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    registros
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Página {currentPage} de {totalPages} ({detailData.length} registros)
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:hover:bg-transparent"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:hover:bg-transparent"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-colors">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {viewMode === 'detail' ? (
                  <>
                    <span className="font-medium dark:text-gray-200">{filteredEntries.length}</span> registros devueltos
                  </>
                ) : (
                  <>
                    <span className="font-medium dark:text-gray-200">{summary.length}</span> agrupaciones (de <span className="font-medium dark:text-gray-200">{filteredEntries.length}</span> registros totales)
                  </>
                )}
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
