import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useDepartmentManagement(filters = {}) {
  const queryClient = useQueryClient()

  const {
    data: departments = [],
    isLoading: loading,
    error: queryError,
    refetch: fetchDepartments
  } = useQuery({
    queryKey: ['departments', 'management', filters],
    queryFn: async () => {
      let query = supabase
        .from('departments')
        .select(`
          *,
          work_center:work_centers(id, name, code)
        `)
        .order('name')

      if (filters.work_center_id) {
        query = query.eq('work_center_id', filters.work_center_id)
      }

      if (filters.active !== undefined && filters.active !== '') {
        query = query.eq('active', filters.active === 'true' || filters.active === true)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    }
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['departments'] })

  const addMutation = useMutation({
    mutationFn: async ({ name, code, work_center_id }) => {
      const { data, error } = await supabase
        .from('departments')
        .insert([{ name, code, work_center_id, active: true }])
        .select(`*, work_center:work_centers(id, name, code)`)

      if (error) throw error
      return data[0]
    },
    onSuccess: invalidate
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('departments')
        .update(updates)
        .eq('id', id)
        .select(`*, work_center:work_centers(id, name, code)`)

      if (error) throw error
      return data[0]
    },
    onSuccess: invalidate
  })

  const toggleActiveMutation = useMutation({
    mutationFn: async (id) => {
      const { data: current, error: fetchError } = await supabase
        .from('departments')
        .select('active')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const { data, error } = await supabase
        .from('departments')
        .update({ active: !current.active })
        .eq('id', id)
        .select(`*, work_center:work_centers(id, name, code)`)

      if (error) throw error
      return data[0]
    },
    onSuccess: invalidate
  })

  const addDepartment = async (name, code, workCenterId) => {
    try {
      const data = await addMutation.mutateAsync({ name, code, work_center_id: workCenterId })
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const updateDepartmentData = async (id, updates) => {
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
    departments,
    loading,
    error: queryError ? queryError.message : null,
    fetchDepartments,
    addDepartment,
    updateDepartmentData,
    toggleActive
  }
}
