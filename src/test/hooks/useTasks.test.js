import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useTasks } from '../../hooks/useTasks'
import { createWrapper } from '../test-utils'
import { supabase } from '../mocks/supabase'
import { mockTask } from '../fixtures'

vi.mock('../../lib/supabase', async (importOriginal) => {
  const mod = await vi.importActual('../mocks/supabase')
  return { ...mod }
})

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.from.mockClear()
    supabase.select.mockClear()
    supabase.insert.mockClear()
    supabase.update.mockClear()
  })

  it('debe cargar las tareas iniciales (filtrando activas por defecto)', async () => {
    // Configuramos el mock para la carga inicial
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({ data: [mockTask], error: null })
        })
      })
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTasks(), { wrapper })

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].id).toBe(1)
  })

  it('debe crear una nueva tarea (addTask)', async () => {
    // Configurar el fetch inicial
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({ data: [], error: null })
        })
      })
    })

    // Configurar el resultado del insert
    supabase.from.mockReturnValueOnce({
      insert: vi.fn().mockReturnValueOnce({
        select: vi.fn().mockResolvedValueOnce({ data: [{ ...mockTask, name: 'Nueva Tarea' }], error: null })
      })
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTasks(), { wrapper })

    let addResult
    await waitFor(async () => {
      addResult = await result.current.addTask({ name: 'Nueva Tarea', is_customer_service: false })
    })

    expect(addResult.success).toBe(true)
    expect(addResult.data.name).toBe('Nueva Tarea')
  })

  it('debe actualizar una tarea (updateTask)', async () => {
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({ data: [mockTask], error: null })
        })
      })
    })

    supabase.from.mockReturnValueOnce({
      update: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockResolvedValueOnce({ data: [{ ...mockTask, name: 'Tarea Editada' }], error: null })
        })
      })
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTasks(), { wrapper })

    let updateResult
    await waitFor(async () => {
      updateResult = await result.current.updateTask(1, { name: 'Tarea Editada' })
    })

    expect(updateResult.success).toBe(true)
    expect(updateResult.data.name).toBe('Tarea Editada')
  })

  it('debe hacer un borrado lógico de tarea (toggleTaskActive)', async () => {
    // El toggle primero busca la tarea en el array que ya cargó react-query
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValueOnce({
        order: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({ data: [mockTask], error: null }) // Tareas iniciales
        })
      })
    })

    // El resultado del toggle
    supabase.from.mockReturnValueOnce({
      update: vi.fn().mockReturnValueOnce({
        eq: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockResolvedValueOnce({ data: [{ ...mockTask, active: false }], error: null })
        })
      })
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTasks(), { wrapper })

    // Esperar a que cargue las tareas para que toggleTaskActive la encuentre en state local
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let toggleResult
    await waitFor(async () => {
      toggleResult = await result.current.toggleTaskActive(1)
    })

    expect(toggleResult.success).toBe(true)
    expect(toggleResult.data.active).toBe(false)
  })
})
