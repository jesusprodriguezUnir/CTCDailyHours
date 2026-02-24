import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Nota: jspdf-autotable se añade automáticamente al prototipo de jsPDF
// cuando se importa, por lo que doc.autoTable() estará disponible

/**
 * Exporta datos a formato Excel (.xlsx)
 * @param {Array} data - Datos a exportar (array de objetos)
 * @param {string} filename - Nombre del archivo sin extensión
 * @param {string} sheetName - Nombre de la hoja de cálculo
 */
export function exportToExcel(data, filename = 'reporte', sheetName = 'Datos') {
  try {
    // Crear un nuevo workbook
    const wb = XLSX.utils.book_new()
    
    // Convertir datos a worksheet
    const ws = XLSX.utils.json_to_sheet(data)
    
    // Ajustar ancho de columnas automáticamente
    const colWidths = []
    if (data.length > 0) {
      Object.keys(data[0]).forEach(key => {
        const maxLength = Math.max(
          key.length,
          ...data.map(row => String(row[key] || '').length)
        )
        colWidths.push({ wch: Math.min(maxLength + 2, 50) })
      })
      ws['!cols'] = colWidths
    }
    
    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    
    // Generar archivo Excel
    XLSX.writeFile(wb, `${filename}.xlsx`)
    
    return { success: true }
  } catch (error) {
    console.error('Error al exportar a Excel:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Exporta datos a formato PDF
 * @param {Array} data - Datos a exportar (array de objetos)
 * @param {string} filename - Nombre del archivo sin extensión
 * @param {string} title - Título del reporte
 * @param {Object} options - Opciones adicionales (orientation, etc.)
 */
export function exportToPDF(data, filename = 'reporte', title = 'Reporte de Horas', options = {}) {
  try {
    if (!data || data.length === 0) {
      console.error('No hay datos para exportar a PDF')
      return { success: false, error: 'No hay datos para exportar' }
    }

    // Configuración por defecto
    const orientation = options.orientation || 'landscape'
    const doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4'
    })
    
    // Título del documento
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.text(title, 14, 15)
    
    // Fecha de generación
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    doc.text(`Generado: ${currentDate}`, 14, 22)
    
    // Preparar datos para la tabla
    if (data.length === 0) {
      doc.text('No hay datos para mostrar', 14, 30)
    } else {
      // Obtener columnas del primer objeto
      const columns = Object.keys(data[0]).map(key => ({
        header: key,
        dataKey: key
      }))
      
      // Generar tabla con autoTable
      // Nota: jspdf-autotable se importa con 'import jspdf-autotable' y extiende automáticamente jsPDF
      doc.autoTable({
        startY: 28,
        columns: columns,
        body: data,
        theme: 'striped',
        headStyles: {
          fillColor: [59, 130, 246], // Azul
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center'
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          overflow: 'linebreak',
          cellWidth: 'auto'
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        columnStyles: {
          // Las columnas numéricas se alinean a la derecha
          ...Object.keys(data[0]).reduce((acc, key, index) => {
            if (typeof data[0][key] === 'number') {
              acc[key] = { halign: 'right' }
            }
            return acc
          }, {})
        },
        margin: { top: 30, left: 14, right: 14 },
        didDrawPage: (dataArg) => {
          // Footer con número de página
          const pageCount = doc.internal.getNumberOfPages()
          doc.setFontSize(8)
          doc.text(
            `Página ${dataArg.pageNumber} de ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
          )
        }
      })
      
      // Si hay un total, agregarlo al final
      if (options.totals) {
        const finalY = doc.lastAutoTable.finalY + 5
        doc.setFontSize(11)
        doc.setFont(undefined, 'bold')
        Object.entries(options.totals).forEach(([key, value], index) => {
          doc.text(`${key}: ${value}`, 14, finalY + (index * 7))
        })
      }
    }
    
    // Guardar PDF
    doc.save(`${filename}.pdf`)
    
    return { success: true }
  } catch (error) {
    console.error('Error al exportar a PDF:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Exporta datos a formato CSV
 * @param {Array} data - Datos a exportar (array de objetos)
 * @param {string} filename - Nombre del archivo sin extensión
 * @param {string} separator - Separador de columnas (por defecto ;)
 */
export function exportToCSV(data, filename = 'reporte', separator = ';') {
  try {
    if (data.length === 0) {
      throw new Error('No hay datos para exportar')
    }
    
    // Obtener headers
    const headers = Object.keys(data[0])
    
    // Crear contenido CSV
    let csvContent = '\uFEFF' // BOM para UTF-8 (compatibilidad con Excel en español)
    
    // Agregar headers
    csvContent += headers.join(separator) + '\n'
    
    // Agregar filas
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header]
        // Escapar valores que contienen el separador o saltos de línea
        if (value === null || value === undefined) {
          return ''
        }
        const strValue = String(value)
        if (strValue.includes(separator) || strValue.includes('\n') || strValue.includes('"')) {
          return `"${strValue.replace(/"/g, '""')}"`
        }
        return strValue
      })
      csvContent += values.join(separator) + '\n'
    })
    
    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    return { success: true }
  } catch (error) {
    console.error('Error al exportar a CSV:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Formatea datos de entradas de tiempo para exportación
 * @param {Array} entries - Entradas de tiempo con información de empleado y tarea
 * @returns {Array} Datos formateados para exportar
 */
export function formatTimeEntriesForExport(entries) {
  return entries.map(entry => ({
    'Empleado': entry.employee?.name || 'N/A',
    'Tarea': entry.task?.name || 'N/A',
    'Fecha': new Date(entry.date).toLocaleDateString('es-ES'),
    'Horas': parseFloat(entry.hours).toFixed(2)
  }))
}

/**
 * Crea datos agrupados por empleado para exportación
 * @param {Array} entries - Entradas de tiempo
 * @param {Array} tasks - Lista de tareas
 * @returns {Array} Datos agrupados por empleado
 */
export function groupByEmployeeForExport(entries, tasks) {
  const grouped = {}
  
  entries.forEach(entry => {
    const employeeName = entry.employee?.name || 'Sin asignar'
    if (!grouped[employeeName]) {
      grouped[employeeName] = {
        'Empleado': employeeName,
        'Total Horas': 0
      }
      tasks.forEach(task => {
        grouped[employeeName][task.name] = 0
      })
    }
    
    const taskName = entry.task?.name || 'Otra'
    if (grouped[employeeName][taskName] !== undefined) {
      grouped[employeeName][taskName] += parseFloat(entry.hours)
    }
    grouped[employeeName]['Total Horas'] += parseFloat(entry.hours)
  })
  
  // Convertir a array y redondear valores
  return Object.values(grouped).map(row => {
    const formatted = { ...row }
    Object.keys(formatted).forEach(key => {
      if (typeof formatted[key] === 'number') {
        formatted[key] = parseFloat(formatted[key].toFixed(2))
      }
    })
    return formatted
  })
}

/**
 * Crea datos agrupados por tarea para exportación
 * @param {Array} entries - Entradas de tiempo
 * @param {Array} employees - Lista de empleados
 * @returns {Array} Datos agrupados por tarea
 */
export function groupByTaskForExport(entries, employees) {
  const grouped = {}
  
  entries.forEach(entry => {
    const taskName = entry.task?.name || 'Sin asignar'
    if (!grouped[taskName]) {
      grouped[taskName] = {
        'Tarea': taskName,
        'Total Horas': 0
      }
    }
    grouped[taskName]['Total Horas'] += parseFloat(entry.hours)
  })
  
  // Convertir a array y redondear valores
  return Object.values(grouped).map(row => {
    const formatted = { ...row }
    Object.keys(formatted).forEach(key => {
      if (typeof formatted[key] === 'number') {
        formatted[key] = parseFloat(formatted[key].toFixed(2))
      }
    })
    return formatted
  })
}

/**
 * Crea datos agrupados por período (día) para exportación
 * @param {Array} entries - Entradas de tiempo
 * @returns {Array} Datos agrupados por fecha
 */
export function groupByPeriodForExport(entries) {
  const grouped = {}
  
  entries.forEach(entry => {
    const date = new Date(entry.date).toLocaleDateString('es-ES')
    if (!grouped[date]) {
      grouped[date] = {
        'Fecha': date,
        'Total Horas': 0,
        'Número de Entradas': 0
      }
    }
    grouped[date]['Total Horas'] += parseFloat(entry.hours)
    grouped[date]['Número de Entradas'] += 1
  })
  
  // Convertir a array y redondear valores
  return Object.values(grouped).map(row => ({
    ...row,
    'Total Horas': parseFloat(row['Total Horas'].toFixed(2))
  })).sort((a, b) => {
    // Ordenar por fecha
    const dateA = new Date(a['Fecha'].split('/').reverse().join('-'))
    const dateB = new Date(b['Fecha'].split('/').reverse().join('-'))
    return dateA - dateB
  })
}
