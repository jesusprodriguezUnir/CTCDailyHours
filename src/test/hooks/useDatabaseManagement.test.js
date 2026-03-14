import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useDatabaseManagement } from '../../hooks/useDatabaseManagement'
import { createWrapper } from '../test-utils'
import { resetDatabase } from '../mocks/supabase'

vi.mock('../../lib/supabase', async (importOriginal) => {
  const mod = await vi.importActual('../mocks/supabase')
  return { ...mod }
})

// Mocks para xlsx
vi.mock('xlsx', () => ({
  read: vi.fn(),
  utils: {
    sheet_to_json: vi.fn()
  }
}))

describe('useDatabaseManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetDatabase.mockClear()
  })

  it('devuelve estado inicial correcto', () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useDatabaseManagement(), { wrapper })

    expect(result.current.loading).toBe(false)
    expect(result.current.progress).toBe(0)
    expect(result.current.error).toBeNull()
  })

  it('falla si faltan hojas obligatorias', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useDatabaseManagement(), { wrapper })

    // Simulamos un archivo con una hoja faltante
    const mockFile = {
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
    }
    
    // Mock de XLSX.read para devolver algo sin las hojas correctas
    const xlsx = await import('xlsx')
    xlsx.read.mockReturnValueOnce({
      SheetNames: ['1_centros_trabajo'],
      Sheets: { '1_centros_trabajo': {} }
    })

    await waitFor(async () => {
      await result.current.resetFromExcel(mockFile)
    })

    expect(result.current.error).toContain('Faltan las siguientes hojas en el Excel')
  })

  it('procesa datos en resetDB y llama a resetDatabase del mock', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useDatabaseManagement(), { wrapper })

    const mockFile = {
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
    }
    
    // Simulamos un Excel válido
    const xlsx = await import('xlsx')
    xlsx.read.mockReturnValueOnce({
      SheetNames: ['1_centros_trabajo', '2_departamentos', '3_clientes', '4_tareas', '5_empleados'],
      Sheets: {
        '1_centros_trabajo': {},
        '2_departamentos': {},
        '3_clientes': {},
        '4_tareas': {},
        '5_empleados': {}
      }
    })

    // Mock sheet_to_json to return minimal valid data
    xlsx.utils.sheet_to_json
      .mockReturnValueOnce([['nombre', 'código', 'activo'], ['Centro 1', 'C1', 'SI']]) // centros
      .mockReturnValueOnce([['centro (código)', 'nombre departamento', 'código dpto.', 'activo'], ['C1', 'Dept 1', 'D1', 'SI']]) // deps
      .mockReturnValueOnce([['nombre', 'código', 'activo'], ['Cliente 1', 'CL1', 'SI']]) // clientes
      .mockReturnValueOnce([['nombre tarea', 'es servicio cliente (si/no)', 'activo'], ['Tarea 1', 'NO', 'SI']]) // tareas
      .mockReturnValueOnce([['nombre completo', 'rol', 'contraseña', 'centro (código)', 'departamento (código)', 'activo'], ['Admin', 'admin', '123', 'C1', 'D1', 'SI']]) // empleados

    await waitFor(async () => {
      await result.current.resetFromExcel(mockFile)
    })

    expect(result.current.error).toBeNull()
    expect(result.current.result).toEqual({ workCenters: 1, departments: 1, customers: 1, tasks: 1, employees: 3 })
    expect(resetDatabase).toHaveBeenCalled()
  })
})
