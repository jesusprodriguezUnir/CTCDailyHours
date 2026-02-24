import { useState, useEffect } from 'react'
import { fetchWorkCenters } from '../lib/supabase'

export function useWorkCenters() {
  const [workCenters, setWorkCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchWorkCenters()
        setWorkCenters(data)
      } catch (err) {
        setError(err.message)
        setWorkCenters([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { workCenters, loading, error }
}
