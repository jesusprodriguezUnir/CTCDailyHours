import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, fetchTimeEntries, createTimeEntry } from '../lib/supabase'

export function useTimeEntries(date = null, user = null, options = { enabled: true }) {
  const queryClient = useQueryClient()

  // For regular employees, filter at database level to enforce access control
  const employeeId = user?.role === 'employee' ? user?.id : null

  const {
    data: entries = [],
    isLoading: loading,
    error: queryError,
    refetch: loadEntries,
    fetchStatus
  } = useQuery({
    queryKey: ['timeEntries', date, employeeId],
    queryFn: async () => {
      const data = await fetchTimeEntries(date, employeeId)
      return data || []
    },
    enabled: options.enabled
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['timeEntries'] })
  }

  const addMutation = useMutation({
    mutationFn: async (entry) => {
      const data = await createTimeEntry(entry)
      return data
    },
    onSuccess: invalidate
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const { error } = await supabase
        .from('time_entries')
        .update(updates)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: invalidate
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: invalidate
  })

  const addEntry = async (entry) => {
    try {
      return await addMutation.mutateAsync(entry)
    } catch (err) {
      throw err
    }
  }

  const updateEntry = async (id, updates) => {
    try {
      await updateMutation.mutateAsync({ id, updates })
    } catch (err) {
      throw err
    }
  }

  const deleteEntry = async (id) => {
    try {
      await deleteMutation.mutateAsync(id)
    } catch (err) {
      throw err
    }
  }

  const getEntriesByDate = (targetDate) => {
    return entries.filter(e => e.date === targetDate)
  }

  return {
    entries,
    loading: options.enabled ? (loading && fetchStatus !== 'idle') : false,
    error: queryError ? queryError.message : null,
    addEntry,
    updateEntry,
    deleteEntry,
    refresh: loadEntries,
    getEntriesByDate
  }
}
