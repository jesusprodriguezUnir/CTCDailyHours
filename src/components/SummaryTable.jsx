import { useMemo } from 'react'
import { TASKS } from '../data/mockData'
import { useTimeEntries } from '../hooks/useTimeEntries'
import { MOCK_EMPLOYEES } from '../data/mockData'

export function SummaryTable({ onBack }) {
  const { entries, loading } = useTimeEntries()

  const summary = useMemo(() => {
    const byEmployee = {}
    const byTask = {}
    const byEmployeeTask = {}

    const allEmployees = MOCK_EMPLOYEES.filter(e => e.role === 'employee')

    allEmployees.forEach(emp => {
      byEmployee[emp.id] = { name: emp.name, total: 0 }
      byTask[emp.id] = {}
      TASKS.forEach(t => {
        byTask[emp.id][t.id] = 0
      })
    })

    TASKS.forEach(t => {
      byTask[t.id] = { name: t.name, total: 0 }
    })

    entries.forEach(entry => {
      const empId = entry.employee_id
      const taskId = entry.task_id
      const hrs = entry.hours || 0

      if (byEmployee[empId]) {
        byEmployee[empId].total += hrs
        if (!byEmployeeTask[empId]) byEmployeeTask[empId] = {}
        byEmployeeTask[empId][taskId] = (byEmployeeTask[empId][taskId] || 0) + hrs
      }

      if (byTask[taskId]) {
        byTask[taskId].total += hrs
      }
    })

    return { byEmployee, byTask, byEmployeeTask }
  }, [entries])

  const downloadCSV = () => {
    const rows = [['Empleado']]
    TASKS.forEach(t => rows[0].push(t.name))
    rows[0].push('Total')

    Object.values(summary.byEmployee).forEach(emp => {
      const row = [emp.name]
      TASKS.forEach(t => {
        const empId = MOCK_EMPLOYEES.find(e => e.name === emp.name)?.id
        row.push(summary.byEmployeeTask[empId]?.[t.id] || 0)
      })
      row.push(emp.total)
      rows.push(row)
    })

    rows.push([''])
    rows.push(['Total por Tarea'])
    TASKS.forEach(t => rows[rows.length - 1].push(t.name))
    rows[rows.length - 1].push('Total')

    rows.push(['TOTAL'])
    TASKS.forEach(t => rows[rows.length - 1].push(summary.byTask[t.id]?.total || 0))
    rows[rows.length - 1].push(
      Object.values(summary.byEmployee).reduce((sum, e) => sum + e.total, 0)
    )

    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `horas_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="mb-4 text-blue-600 hover:underline flex items-center gap-1"
      >
        ← Cambiar usuario
      </button>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Resumen de Horas</h2>
        <button
          onClick={downloadCSV}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
        >
          📥 Descargar CSV
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-semibold">Empleado</th>
              {TASKS.map(t => (
                <th key={t.id} className="p-3 text-center font-semibold">{t.name}</th>
              ))}
              <th className="p-3 text-center font-semibold bg-gray-200">Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(summary.byEmployee)
              .filter(([_, data]) => data.total > 0)
              .map(([empId, data]) => (
                <tr key={empId} className="border-t">
                  <td className="p-3 font-medium">{data.name}</td>
                  {TASKS.map(t => (
                    <td key={t.id} className="p-3 text-center">
                      {summary.byEmployeeTask[empId]?.[t.id] || '-'}
                    </td>
                  ))}
                  <td className="p-3 text-center font-bold bg-gray-50">{data.total}</td>
                </tr>
              ))}
          </tbody>
          <tfoot className="bg-gray-200 font-bold">
            <tr>
              <td className="p-3">TOTAL</td>
              {TASKS.map(t => (
                <td key={t.id} className="p-3 text-center">
                  {summary.byTask[t.id]?.total || 0}
                </td>
              ))}
              <td className="p-3 text-center">
                {Object.values(summary.byEmployee).reduce((s, e) => s + e.total, 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
