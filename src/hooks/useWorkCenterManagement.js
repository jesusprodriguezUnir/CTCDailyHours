import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useWorkCenterManagement() {
  const queryClient = useQueryClient()

  const {
    data: workCenters = [],
    isLoading: loading,
    error: queryError,
    refetch: fetchWorkCenters
  } = useQuery({
    queryKey: ['workCenters', 'management'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_centers')
        .select('*')
        .order('name')

      if (error) throw error
      return data || []
    }
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['workCenters'] })

  const addMutation = useMutation({
    mutationFn: async ({ name, code }) => {
      const { data, error } = await supabase
        .from('work_centers')
        .insert([{ name, code, active: true }])
        .select()

      if (error) throw error
      return data[0]
    },
    onSuccess: invalidate
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('work_centers')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error
      return data[0]
    },
    onSuccess: invalidate
  })

  const toggleActiveMutation = useMutation({
    mutationFn: async (id) => {
      const { data: current, error: fetchError } = await supabase
        .from('work_centers')
        .select('active')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const { data, error } = await supabase
        .from('work_centers')
        .update({ active: !current.active })
        .eq('id', id)
        .select()

      if (error) throw error
      return data[0]
    },
    onSuccess: invalidate
  })

  const addWorkCenter = async (name, code) => {
    try {
      const data = await addMutation.mutateAsync({ name, code })
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const updateWorkCenterData = async (id, updates) => {
    try {
      const data = await updateMutation.mutateAsync({ id, updates })
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const toggleActive = async (id) => {
    try {
      const data = await toggleActiveMutation.mutateAsync(id)
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  return {
    workCenters,
    loading,
    error: queryError ? queryError.message : null,
    fetchWorkCenters,
    addWorkCenter,
    updateWorkCenterData,
    toggleActive
  }
}
