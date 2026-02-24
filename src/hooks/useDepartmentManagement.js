import { useState } from 'react'
import { 
  fetchAllDepartments, 
  createDepartment, 
  updateDepartment, 
  toggleDepartmentActive 
} from '../lib/supabase'

export function useDepartmentManagement() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchDepartments = async (workCenterId = null) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAllDepartments(workCenterId)
      return { success: true, data }
    } catch (err) {
      const errorMsg = err.message || 'Error al cargar departamentos'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const addDepartment = async (name, code, workCenterId) => {
    setLoading(true)
    setError(null)
    try {
      const data = await createDepartment({ name, code, work_center_id: workCenterId })
      return { success: true, data }
    } catch (err) {
      const errorMsg = err.message || 'Error al crear departamento'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const updateDepartmentData = async (id, updates) => {
    setLoading(true)
    setError(null)
    try {
      const data = await updateDepartment(id, updates)
      return { success: true, data }
    } catch (err) {
      const errorMsg = err.message || 'Error al actualizar departamento'
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
      const data = await toggleDepartmentActive(id)
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
    fetchDepartments,
    addDepartment,
    updateDepartmentData,
    toggleActive
  }
}
