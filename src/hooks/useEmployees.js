import { useState, useEffect } from 'react'
import { MOCK_EMPLOYEES } from '../data/mockData'
import { fetchEmployees } from '../lib/supabase'

const USE_MOCK = true

export function useEmployees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        if (USE_MOCK) {
          setEmployees(MOCK_EMPLOYEES)
        } else {
          const data = await fetchEmployees()
          setEmployees(data)
        }
      } catch (err) {
        setError(err.message)
        setEmployees(MOCK_EMPLOYEES)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { employees, loading, error }
}
