import { useQuery } from '@tanstack/react-query'
import { fetchDepartments as fetchActiveDepartments } from '../lib/supabase'

export function useDepartments(workCenterId = null) {
  const {
    data: departments = [],
    isLoading: loading,
    error: queryError
  } = useQuery({
    queryKey: ['departments', 'active', workCenterId],
    queryFn: async () => {
      const data = await fetchActiveDepartments(workCenterId)
      return data || []
    }
  })

  return {
    departments,
    loading,
    error: queryError ? queryError.message : null
  }
}
