import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useEmployeeManagement } from '../../hooks/useEmployeeManagement'
import { createWrapper } from '../test-utils'
import { supabase } from '../mocks/supabase'
import { mockEmployee } from '../fixtures'

vi.mock('../../lib/supabase', async (importOriginal) => {
  const mod = await vi.importActual('../mocks/supabase')
  return { ...mod }
})

describe('useEmployeeManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.from.mockClear()
    supabase.select.mockClear()
    supabase.insert.mockClear()
    supabase.update.mockClear()
    supabase.delete.mockClear()
  })

  it('debe cargar los empleados iniciales', async () => {
    // Configurar respuesta para fetch initial
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockResolvedValueOnce({ data: [mockEmployee], error: null })
      })
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useEmployeeManagement(), { wrapper })

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.employees).toHaveLength(1)
    expect(result.current.employees[0].name).toBe('Juan Perez')
  })

  it('falla al crear un empleado con datos inválidos', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useEmployeeManagement(), { wrapper })

    let errorResult
    await waitFor(async () => {
      errorResult = await result.current.addEmployee('', 'employee', '123', 1)
    })

    expect(errorResult.success).toBe(false)
    expect(errorResult.error).toContain('El nombre debe tener al menos 2 caracteres')
    expect(supabase.insert).not.toHaveBeenCalled()
  })

  it('debe crear un empleado valido', async () => {
    // 1. Array vacío al cargar inicial
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockResolvedValueOnce({ data: [], error: null })
      })
    })

    // 2. Comprobación de existencia de nombre (devuelve vacío = no existe)
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          limit: vi.fn().mockResolvedValueOnce({ data: [], error: null })
        })
      })
    })

    // 3. Resultado final del insert
    supabase.from.mockReturnValueOnce({
      insert: vi.fn().mockReturnValueOnce({
        select: vi.fn().mockResolvedValueOnce({ 
          data: [{ id: 4, name: 'Nuevo', role: 'employee', department_id: 1, active: true }], 
          error: null 
        })
      })
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useEmployeeManagement(), { wrapper })

    let addResult
    await waitFor(async () => {
      addResult = await result.current.addEmployee('Nuevo', 'employee', '12345', 1)
    })

    expect(addResult.success).toBe(true)
    expect(addResult.data.name).toBe('Nuevo')
  })

  it('no permite hardDelete si el empleado tiene horas registradas', async () => {
    // 1. Array inicial
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockResolvedValueOnce({ data: [mockEmployee], error: null })
      })
    })

    // 2. Retorna registros de hora para simular que no se puede borrar
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          limit: vi.fn().mockResolvedValueOnce({ data: [{ id: 1 }], error: null })
        })
      })
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useEmployeeManagement(), { wrapper })

    let deleteResult
    await waitFor(async () => {
      deleteResult = await result.current.hardDeleteEmployee(mockEmployee.id)
    })

    expect(deleteResult.success).toBe(false)
    expect(deleteResult.error).toContain('No se puede eliminar un empleado con registros')
    expect(supabase.delete).not.toHaveBeenCalled()
  })
})
