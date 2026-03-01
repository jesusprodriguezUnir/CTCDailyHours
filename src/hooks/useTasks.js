import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useTasks(includeInactive = false) {
  const queryClient = useQueryClient()

  // 1. Fetching con useQuery
  const {
    data: tasks = [],
    isLoading: loading,
    error: queryError,
    refetch: refresh
  } = useQuery({
    queryKey: ['tasks', includeInactive],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          customer:customers(id, name, code)
        `)
        .order('name')

      if (!includeInactive) {
        query = query.eq('active', true)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    }
  })

  // 2. Mutations
  const addMutation = useMutation({
    mutationFn: async ({ name, is_customer_service = false, customer_id = null }) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ name, is_customer_service, customer_id, active: true }])
        .select(`*, customer:customers(id, name, code)`)

      if (error) throw error
      return data[0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select(`*, customer:customers(id, name, code)`)

      if (error) throw error
      return data[0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  const toggleActiveMutation = useMutation({
    mutationFn: async (id) => {
      const task = tasks.find(t => t.id === id)
      if (!task) throw new Error('Tarea no encontrada')

      const { data, error } = await supabase
        .from('tasks')
        .update({ active: !task.active })
        .eq('id', id)
        .select()

      if (error) throw error
      return data[0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  const hardDeleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  // Funciones wrapper para mantener la API compatible con los componentes actuales
  const addTask = async (taskData) => {
    try {
      const data = await addMutation.mutateAsync(taskData)
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const updateTask = async (id, updates) => {
    try {
      const data = await updateMutation.mutateAsync({ id, updates })
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const toggleTaskActive = async (id) => {
    try {
      const data = await toggleActiveMutation.mutateAsync(id)
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const deleteTask = async (id) => toggleTaskActive(id)

  const hardDeleteTask = async (id) => {
    try {
      await hardDeleteMutation.mutateAsync(id)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // Mantenemos la función fetchTasks dummy por retrocompatibilidad temporal
  const fetchTasks = () => refresh()

  return {
    tasks,
    loading,
    error: queryError ? queryError.message : null,
    fetchTasks,
    addTask,
    updateTask,
    toggleTaskActive,
    deleteTask,
    hardDeleteTask,
    refresh
  }
}
