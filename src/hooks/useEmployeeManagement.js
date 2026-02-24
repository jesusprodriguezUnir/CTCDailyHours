import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useEmployeeManagement() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Agregar nuevo empleado
  const addEmployee = async (name, role, password, departmentId) => {
    setLoading(true)
    setError(null)
    
    try {
      // Validaciones
      if (!name || name.trim().length < 2) {
        throw new Error('El nombre debe tener al menos 2 caracteres')
      }
      
      if (!password || password.length < 4) {
        throw new Error('La contraseña debe tener al menos 4 caracteres')
      }
      
      if (!['employee', 'responsible', 'admin'].includes(role)) {
        throw new Error('Rol inválido')
      }

      if (!departmentId) {
        throw new Error('El departamento es requerido')
      }
      
      // Verificar si ya existe un empleado con ese nombre
      const { data: existing, error: checkError } = await supabase
        .from('employees')
        .select('id')
        .eq('name', name.trim())
        .limit(1)
      
      if (checkError) throw checkError
      
      if (existing && existing.length > 0) {
        throw new Error('Ya existe un empleado con ese nombre')
      }
      
      // Insertar nuevo empleado
      const { data, error: insertError } = await supabase
        .from('employees')
        .insert([{
          name: name.trim(),
          role,
          password,
          department_id: departmentId,
          active: true
        }])
        .select()
      
      if (insertError) throw insertError
      
      return { success: true, data: data[0] }
    } catch (err) {
      console.error('Error al agregar empleado:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Actualizar empleado existente
  const updateEmployee = async (id, updates) => {
    setLoading(true)
    setError(null)
    
    try {
      // Validaciones
      if (updates.name && updates.name.trim().length < 2) {
        throw new Error('El nombre debe tener al menos 2 caracteres')
      }
      
      if (updates.password && updates.password.length < 4) {
        throw new Error('La contraseña debe tener al menos 4 caracteres')
      }
      
      if (updates.role && !['employee', 'responsible', 'admin'].includes(updates.role)) {
        throw new Error('Rol inválido')
      }

      if (updates.department_id === null) {
        throw new Error('El departamento es requerido')
      }
      
      // Si se actualiza el nombre, verificar que no exista otro con ese nombre
      if (updates.name) {
        const { data: existing, error: checkError } = await supabase
          .from('employees')
          .select('id')
          .eq('name', updates.name.trim())
          .neq('id', id)
          .limit(1)
        
        if (checkError) throw checkError
        
        if (existing && existing.length > 0) {
          throw new Error('Ya existe un empleado con ese nombre')
        }
        
        updates.name = updates.name.trim()
      }
      
      const { data, error: updateError } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
      
      if (updateError) throw updateError
      
      return { success: true, data: data[0] }
    } catch (err) {
      console.error('Error al actualizar empleado:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Activar/Desactivar empleado (soft delete)
  const toggleEmployeeActive = async (id) => {
    setLoading(true)
    setError(null)
    
    try {
      // Obtener el estado actual
      const { data: employee, error: fetchError } = await supabase
        .from('employees')
        .select('active')
        .eq('id', id)
        .single()
      
      if (fetchError) throw fetchError
      if (!employee) throw new Error('Empleado no encontrado')
      
      const { data, error: updateError } = await supabase
        .from('employees')
        .update({ active: !employee.active })
        .eq('id', id)
        .select()
      
      if (updateError) throw updateError
      
      return { success: true, data: data[0] }
    } catch (err) {
      console.error('Error al cambiar estado del empleado:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Eliminar empleado (soft delete - marca como inactivo)
  const deleteEmployee = async (id) => {
    return await toggleEmployeeActive(id)
  }

  // Eliminar empleado permanentemente (usar con precaución)
  const hardDeleteEmployee = async (id) => {
    setLoading(true)
    setError(null)
    
    try {
      // Verificar si el empleado tiene entradas de tiempo
      const { data: entries, error: checkError } = await supabase
        .from('time_entries')
        .select('id')
        .eq('employee_id', id)
        .limit(1)
      
      if (checkError) throw checkError
      
      if (entries && entries.length > 0) {
        throw new Error('No se puede eliminar un empleado con registros de horas. Desactívalo en su lugar.')
      }
      
      const { error: deleteError } = await supabase
        .from('employees')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      return { success: true }
    } catch (err) {
      console.error('Error al eliminar empleado:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Obtener empleados con filtros
  const fetchEmployees = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      let query = supabase
        .from('employees')
        .select(`
          *,
          department:departments(
            id,
            name,
            code,
            work_center:work_centers(id, name, code)
          )
        `)
        .order('name')
      
      // Aplicar filtros
      if (filters.role) {
        query = query.eq('role', filters.role)
      }
      
      if (filters.active !== undefined) {
        query = query.eq('active', filters.active)
      }
      
      const { data, error: fetchError } = await query
      
      if (fetchError) throw fetchError
      
      return { success: true, data: data || [] }
    } catch (err) {
      console.error('Error al obtener empleados:', err)
      setError(err.message)
      return { success: false, error: err.message, data: [] }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    addEmployee,
    updateEmployee,
    toggleEmployeeActive,
    deleteEmployee,
    hardDeleteEmployee,
    fetchEmployees
  }
}
