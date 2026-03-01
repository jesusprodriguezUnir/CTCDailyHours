import { useQuery } from '@tanstack/react-query'
import { fetchEmployees as fetchActiveEmployees } from '../lib/supabase'

export function useEmployees() {
  const {
    data: employees = [],
    isLoading: loading,
    error: queryError
  } = useQuery({
    queryKey: ['employees', 'active'],
    queryFn: async () => {
      const data = await fetchActiveEmployees()
      return data || []
    }
  })

  return {
    employees,
    loading,
    error: queryError ? queryError.message : null
  }
}
