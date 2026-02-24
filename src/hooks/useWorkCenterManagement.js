import { useState } from 'react'
import { 
  fetchAllWorkCenters, 
  createWorkCenter, 
  updateWorkCenter, 
  toggleWorkCenterActive 
} from '../lib/supabase'

export function useWorkCenterManagement() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchWorkCenters = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAllWorkCenters()
      return { success: true, data }
    } catch (err) {
      const errorMsg = err.message || 'Error al cargar centros de trabajo'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const addWorkCenter = async (name, code) => {
    setLoading(true)
    setError(null)
    try {
      const data = await createWorkCenter({ name, code })
      return { success: true, data }
    } catch (err) {
      const errorMsg = err.message || 'Error al crear centro de trabajo'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const updateWorkCenterData = async (id, updates) => {
    setLoading(true)
    setError(null)
    try {
      const data = await updateWorkCenter(id, updates)
      return { success: true, data }
    } catch (err) {
      const errorMsg = err.message || 'Error al actualizar centro de trabajo'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (id) => {
    setLoading(true)
    setError(null)
    try {
      const data = await toggleWorkCenterActive(id)
      return { success: true, data }
    } catch (err) {
      const errorMsg = err.message || 'Error al cambiar estado'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    fetchWorkCenters,
    addWorkCenter,
    updateWorkCenterData,
    toggleActive
  }
}
