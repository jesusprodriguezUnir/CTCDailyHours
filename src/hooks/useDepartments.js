import { useState, useEffect } from 'react'
import { fetchDepartments } from '../lib/supabase'

export function useDepartments(workCenterId = null) {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchDepartments(workCenterId)
        setDepartments(data)
      } catch (err) {
        setError(err.message)
        setDepartments([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [workCenterId])

  return { departments, loading, error }
}
