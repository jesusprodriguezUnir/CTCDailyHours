import { useQuery } from '@tanstack/react-query'
import { fetchWorkCenters as fetchActiveWorkCenters } from '../lib/supabase'

export function useWorkCenters() {
  const {
    data: workCenters = [],
    isLoading: loading,
    error: queryError
  } = useQuery({
    queryKey: ['workCenters', 'active'],
    queryFn: async () => {
      const data = await fetchActiveWorkCenters()
      return data || []
    }
  })

  return {
    workCenters,
    loading,
    error: queryError ? queryError.message : null
  }
}
