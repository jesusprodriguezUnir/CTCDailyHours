import { describe, it, expect, vi } from 'vitest'
import {
  formatTimeEntriesForExport,
  groupByEmployeeForExport,
  groupByTaskForExport,
  groupByPeriodForExport,
  exportToCSV
} from '../../utils/exportHelpers'
import { mockTimeEntry, mockEmployee, mockTask } from '../fixtures'

describe('exportHelpers', () => {
  describe('formatTimeEntriesForExport', () => {
    it('formatea correctamente una entrada de tiempo con datos completos', () => {
      const result = formatTimeEntriesForExport([mockTimeEntry])
      
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        'Empleado': 'Juan Perez',
        'Centro': 'Centro Base',
        'Departamento': 'Logística',
        'Tarea': 'Descarga de Material',
        'Asistencia Cliente': 'Si',
        'Cliente': 'Cliente Importante',
        'Fecha': new Date('2023-10-25').toLocaleDateString('es-ES'),
        'Horas': '4.50'
      })
    })

    it('maneja valores nulos de relaciones graciosas (Manejo de N/A)', () => {
      const incompleteEntry = {
        id: 2,
        date: '2023-10-26T00:00:00.000Z',
        hours: 2,
        // no employee and no task
      }
      const result = formatTimeEntriesForExport([incompleteEntry])
      
      expect(result[0]).toEqual({
        'Empleado': 'N/A',
        'Centro': 'N/A',
        'Departamento': 'N/A',
        'Tarea': 'N/A',
        'Asistencia Cliente': 'No',
        'Cliente': 'N/A',
        'Fecha': new Date('2023-10-26T00:00:00.000Z').toLocaleDateString('es-ES'),
        'Horas': '2.00'
      })
    })
  })

  describe('groupByEmployeeForExport', () => {
    it('agrupa horas por empleado y tarea', () => {
      const entries = [
        mockTimeEntry,
        { ...mockTimeEntry, id: 2, hours: 2 }, // Misma persona y tarea: +2h
        { 
          ...mockTimeEntry, 
          id: 3, 
          task: { ...mockTask, name: 'Otra Tarea' },
          hours: 1
        }
      ]
      
      const tasks = [mockTask, { ...mockTask, name: 'Otra Tarea' }]
      
      const result = groupByEmployeeForExport(entries, tasks)
      
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        'Empleado': 'Juan Perez',
        'Centro': 'Centro Base',
        'Departamento': 'Logística',
        'Total Horas': 7.5,
        'Descarga de Material': 6.5,
        'Otra Tarea': 1
      })
    })
  })

  describe('groupByTaskForExport', () => {
    it('agrupa horas por tarea', () => {
      const entries = [
        mockTimeEntry,
        { ...mockTimeEntry, id: 2, hours: 2 }
      ]
      
      const result = groupByTaskForExport(entries)
      
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        'Tarea': 'Descarga de Material',
        'Asistencia Cliente': 'Si',
        'Cliente': 'Cliente Importante',
        'Total Horas': 6.5
      })
    })
  })

  describe('groupByPeriodForExport', () => {
    it('agrupa horas por fecha y suma métricas', () => {
      const entries = [
        mockTimeEntry, // 2023-10-25: 4.5h
        { ...mockTimeEntry, id: 2, hours: 1 }, // Misma fecha: +1h -> 5.5h
        { ...mockTimeEntry, id: 3, date: '2023-10-26', hours: 2 } // Otra fecha: 2h
      ]
      
      const result = groupByPeriodForExport(entries)
      
      expect(result).toHaveLength(2)
      
      // La primera entrada debería ser 25 de Octubre
      expect(result[0]).toMatchObject({
        'Fecha': new Date('2023-10-25').toLocaleDateString('es-ES'),
        'Total Horas': 5.5,
        'Número de Entradas': 2,
        'Centros': 'Centro Base',
        'Departamentos': 'Logística'
      })
      
      // La segunda entrada debería ser 26 de Octubre
      expect(result[1]).toMatchObject({
        'Fecha': new Date('2023-10-26').toLocaleDateString('es-ES'),
        'Total Horas': 2,
        'Número de Entradas': 1
      })
    })
  })

  describe('exportToCSV', () => {
    beforeEach(() => {
      // Mock para document y window.URL si falla en JSDOM
      global.URL.createObjectURL = vi.fn()
      global.Blob = vi.fn()
      
      const mockElement = {
        setAttribute: vi.fn(),
        style: {},
        click: vi.fn()
      }
      document.createElement = vi.fn().mockReturnValue(mockElement)
      document.body.appendChild = vi.fn()
      document.body.removeChild = vi.fn()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('falla si no hay datos', () => {
      const result = exportToCSV([])
      expect(result).toEqual({ success: false, error: 'No hay datos para exportar' })
    })

    it('ejecuta el flujo de exportación con datos válidos', () => {
      const data = [{ Nombre: 'Test', Edad: 30 }]
      const result = exportToCSV(data, 'testfile')
      
      expect(result).toEqual({ success: true })
      expect(global.Blob).toHaveBeenCalled()
      expect(document.createElement).toHaveBeenCalledWith('a')
    })
  })
})
