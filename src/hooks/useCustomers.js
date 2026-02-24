import { useState, useEffect } from 'react'
import { fetchCustomers } from '../lib/supabase'

export function useCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchCustomers()
        setCustomers(data)
      } catch (err) {
        setError(err.message)
        setCustomers([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { customers, loading, error }
}
