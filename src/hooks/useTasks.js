import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar todas las tareas (incluyendo inactivas para administración)
  const fetchTasks = useCallback(async (includeInactive = false) => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          customer:customers(id, name, code)
        `)
        .order('name')
      
      // Por defecto, solo mostrar tareas activas
      if (!includeInactive) {
        query = query.eq('active', true)
      }
      
      const { data, error: fetchError } = await query
      
      if (fetchError) throw fetchError
      setTasks(data || [])
    } catch (err) {
      console.error('Error al cargar tareas:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar tareas al montar el componente
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Agregar nueva tarea
  const addTask = async ({ name, is_customer_service = false, customer_id = null }) => {
    setError(null)
    try {
      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert([{
          name,
          is_customer_service,
          customer_id,
          active: true
        }])
        .select()
      
      if (insertError) throw insertError
      
      await fetchTasks(true)
      
      return { success: true, data: data[0] }
    } catch (err) {
      console.error('Error al agregar tarea:', err)
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  // Actualizar tarea existente
  const updateTask = async (id, updates) => {
    setError(null)
    try {
      const { data, error: updateError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
      
      if (updateError) throw updateError
      
      await fetchTasks(true)
      
      return { success: true, data: data[0] }
    } catch (err) {
      console.error('Error al actualizar tarea:', err)
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  // Activar/Desactivar tarea (soft delete)
  const toggleTaskActive = async (id) => {
    setError(null)
    try {
      // Obtener el estado actual
      const task = tasks.find(t => t.id === id)
      if (!task) throw new Error('Tarea no encontrada')
      
      const { data, error: updateError } = await supabase
        .from('tasks')
        .update({ active: !task.active })
        .eq('id', id)
        .select()
      
      if (updateError) throw updateError
      
      // Actualizar el estado local
      if (data && data.length > 0) {
        setTasks(prev => 
          prev.map(task => task.id === id ? data[0] : task)
        )
      }
      
      return { success: true, data: data[0] }
    } catch (err) {
      console.error('Error al cambiar estado de tarea:', err)
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  // Eliminar tarea (soft delete - marca como inactiva)
  const deleteTask = async (id) => {
    return await toggleTaskActive(id)
  }

  // Eliminar tarea permanentemente (usar con precaución)
  const hardDeleteTask = async (id) => {
    setError(null)
    try {
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      // Actualizar el estado local
      setTasks(prev => prev.filter(task => task.id !== id))
      
      return { success: true }
    } catch (err) {
      console.error('Error al eliminar tarea:', err)
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  // Refrescar la lista de tareas
  const refresh = () => {
    fetchTasks()
  }

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    addTask,
    updateTask,
    toggleTaskActive,
    deleteTask,
    hardDeleteTask,
    refresh
  }
}
