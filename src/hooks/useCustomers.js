import { useQuery } from '@tanstack/react-query'
import { fetchCustomers } from '../lib/supabase'

export function useCustomers() {
  const {
    data: customers = [],
    isLoading: loading,
    error: queryError
  } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const data = await fetchCustomers()
      return data || []
    }
  })

  return { customers, loading, error: queryError ? queryError.message : null }
}
