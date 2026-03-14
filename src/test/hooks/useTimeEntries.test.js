import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useTimeEntries } from '../../hooks/useTimeEntries'
import { createWrapper } from '../test-utils'
import { supabase, fetchTimeEntries, createTimeEntry } from '../mocks/supabase'
import { mockTimeEntry, mockEmployee } from '../fixtures'

// Mock the real supabase module with our mock version
vi.mock('../../lib/supabase', async (importOriginal) => {
  const mod = await vi.importActual('../mocks/supabase')
  return {
    ...mod
  }
})

describe('useTimeEntries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchTimeEntries.mockClear()
    createTimeEntry.mockClear()
  })

  it('debe cargar las entradas iniciales', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTimeEntries(), { wrapper })

    // Inmediatamente el array es vacío mientras carga, o muestra loading = true
    expect(result.current.loading).toBe(true)

    // Al finalizar la carga, debería devolver las entradas
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.entries).toHaveLength(1)
    expect(result.current.entries[0].id).toBe(mockTimeEntry.id)
    expect(fetchTimeEntries).toHaveBeenCalledTimes(1)
  })

  it('debe pasar el id del empleado regular a supabase', async () => {
    const wrapper = createWrapper()
    renderHook(() => useTimeEntries(null, mockEmployee), { wrapper })

    await waitFor(() => {
      // Como mockEmployee tiene role 'employee', debería pasar el ID
      expect(fetchTimeEntries).toHaveBeenCalledWith(null, mockEmployee.id)
    })
  })

  it('debe crear una entrada nueva', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTimeEntries(), { wrapper })

    const nuevaEntrada = {
      date: '2023-10-30',
      hours: 2,
      employee_id: 1,
      task_id: 1
    }

    // Ejecuta la mutación
    let response
    await waitFor(async () => {
      response = await result.current.addEntry(nuevaEntrada)
    })

    expect(createTimeEntry).toHaveBeenCalledWith(nuevaEntrada)
    expect(response).toEqual([mockTimeEntry]) // el mock devuelve array con entrada
  })

  it('debe actualizar una entrada existente', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTimeEntries(), { wrapper })

    await waitFor(async () => {
      await result.current.updateEntry(1, { hours: 5 })
    })

    expect(supabase.from).toHaveBeenCalledWith('time_entries')
    expect(supabase.update).toHaveBeenCalledWith({ hours: 5 })
    expect(supabase.eq).toHaveBeenCalledWith('id', 1)
  })

  it('debe eliminar una entrada existente', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTimeEntries(), { wrapper })

    await waitFor(async () => {
      await result.current.deleteEntry(1)
    })

    expect(supabase.from).toHaveBeenCalledWith('time_entries')
    expect(supabase.delete).toHaveBeenCalled()
    expect(supabase.eq).toHaveBeenCalledWith('id', 1)
  })

  it('filtra entradas por fecha helper getEntriesByDate', async () => {
    const wrapper = createWrapper()
    const { result } = renderHook(() => useTimeEntries(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // La fecha del mock es 2023-10-25
    const match = result.current.getEntriesByDate('2023-10-25')
    expect(match).toHaveLength(1)

    const noMatch = result.current.getEntriesByDate('2023-10-26')
    expect(noMatch).toHaveLength(0)
  })
})
