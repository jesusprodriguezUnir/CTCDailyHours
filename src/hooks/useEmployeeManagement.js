import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useEmployeeManagement(filters = {}) {
  const queryClient = useQueryClient()

  const {
    data: employees = [],
    isLoading: loading,
    error: queryError,
    refetch: fetchEmployees
  } = useQuery({
    queryKey: ['employees', 'management', filters],
    queryFn: async () => {
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

      if (filters.role) {
        query = query.eq('role', filters.role)
      }

      if (filters.active !== undefined && filters.active !== '') {
        query = query.eq('active', filters.active === 'true' || filters.active === true)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    }
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['employees'] })

  const addMutation = useMutation({
    mutationFn: async ({ name, role, password, department_id }) => {
      if (!name || name.trim().length < 2) throw new Error('El nombre debe tener al menos 2 caracteres')
      if (!password || password.length < 4) throw new Error('La contraseña debe tener al menos 4 caracteres')
      if (!['employee', 'responsible', 'admin'].includes(role)) throw new Error('Rol inválido')
      if (!department_id) throw new Error('El departamento es requerido')

      const { data: existing, error: checkError } = await supabase
        .from('employees')
        .select('id')
        .eq('name', name.trim())
        .limit(1)

      if (checkError) throw checkError
      if (existing && existing.length > 0) throw new Error('Ya existe un empleado con ese nombre')

      const { data, error: insertError } = await supabase
        .from('employees')
        .insert([{
          name: name.trim(),
          role,
          password,
          department_id,
          active: true
        }])
        .select()

      if (insertError) throw insertError
      return data[0]
    },
    onSuccess: invalidate
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      if (updates.name && updates.name.trim().length < 2) throw new Error('El nombre debe tener al menos 2 caracteres')
      if (updates.password && updates.password.length < 4) throw new Error('La contraseña debe tener al menos 4 caracteres')
      if (updates.role && !['employee', 'responsible', 'admin'].includes(updates.role)) throw new Error('Rol inválido')
      if ('department_id' in updates && !updates.department_id) throw new Error('El departamento es requerido')

      if (updates.name) {
        const { data: existing, error: checkError } = await supabase
          .from('employees')
          .select('id')
          .eq('name', updates.name.trim())
          .neq('id', id)
          .limit(1)

        if (checkError) throw checkError
        if (existing && existing.length > 0) throw new Error('Ya existe un empleado con ese nombre')
        updates.name = updates.name.trim()
      }

      const { data, error: updateError } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()

      if (updateError) throw updateError
      return data[0]
    },
    onSuccess: invalidate
  })

  const toggleActiveMutation = useMutation({
    mutationFn: async (id) => {
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
      return data[0]
    },
    onSuccess: invalidate
  })

  const hardDeleteMutation = useMutation({
    mutationFn: async (id) => {
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
      return true
    },
    onSuccess: invalidate
  })

  const addEmployee = async (name, role, password, departmentId) => {
    try {
      const data = await addMutation.mutateAsync({ name, role, password, department_id: departmentId })
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const updateEmployee = async (id, updates) => {
    try {
      const data = await updateMutation.mutateAsync({ id, updates })
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const toggleEmployeeActive = async (id) => {
    try {
      const data = await toggleActiveMutation.mutateAsync(id)
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const deleteEmployee = async (id) => toggleEmployeeActive(id)

  const hardDeleteEmployee = async (id) => {
    try {
      await hardDeleteMutation.mutateAsync(id)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  return {
    employees,
    loading,
    error: queryError ? queryError.message : null,
    addEmployee,
    updateEmployee,
    toggleEmployeeActive,
    deleteEmployee,
    hardDeleteEmployee,
    fetchEmployees
  }
}
