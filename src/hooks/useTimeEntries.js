import { useState, useEffect, useCallback } from 'react'
import { fetchTimeEntries, createTimeEntry } from '../lib/supabase'

const USE_MOCK = false

let mockEntries = [
  { id: 1, employee_id: 8, task_id: 1, hours: 3.0, date: '2026-02-23', created_at: '2026-02-23T08:00:00Z' },
  { id: 2, employee_id: 8, task_id: 2, hours: 1.5, date: '2026-02-23', created_at: '2026-02-23T08:30:00Z' },
  { id: 3, employee_id: 8, task_id: 3, hours: 0.5, date: '2026-02-23', created_at: '2026-02-23T09:00:00Z' },
  { id: 4, employee_id: 9, task_id: 1, hours: 2.0, date: '2026-02-23', created_at: '2026-02-23T10:00:00Z' },
  { id: 5, employee_id: 8, task_id: 1, hours: 4.0, date: '2026-02-22', created_at: '2026-02-22T08:00:00Z' },
  { id: 6, employee_id: 8, task_id: 4, hours: 2.0, date: '2026-02-22', created_at: '2026-02-22T12:00:00Z' },
]

export function useTimeEntries(date = null, user = null) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadEntries = useCallback(async () => {
    setLoading(true)
    try {
      if (USE_MOCK) {
        const filtered = date 
          ? mockEntries.filter(e => e.date === date)
          : mockEntries
        setEntries(filtered)
      } else {
        // For regular employees, filter at database level to enforce access control
        const employeeId = user?.role === 'employee' ? user.id : null
        const data = await fetchTimeEntries(date, employeeId)
        setEntries(data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [date, user?.id, user?.role])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  const addEntry = async (entry) => {
    try {
      if (USE_MOCK) {
        const newEntry = { 
          ...entry, 
          id: Date.now(), 
          created_at: new Date().toISOString() 
        }
        mockEntries = [newEntry, ...mockEntries]
        setEntries(prev => [newEntry, ...prev])
        return newEntry
      } else {
        const data = await createTimeEntry(entry)
        await loadEntries()
        return data
      }
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updateEntry = async (id, updates) => {
    try {
      if (USE_MOCK) {
        mockEntries = mockEntries.map(e => 
          e.id === id ? { ...e, ...updates } : e
        )
        setEntries(prev => prev.map(e => 
          e.id === id ? { ...e, ...updates } : e
        ))
      } else {
        const { error } = await supabase
          .from('time_entries')
          .update(updates)
          .eq('id', id)
        if (error) throw error
        await loadEntries()
      }
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const deleteEntry = async (id) => {
    try {
      if (USE_MOCK) {
        mockEntries = mockEntries.filter(e => e.id !== id)
        setEntries(prev => prev.filter(e => e.id !== id))
      } else {
        const { error } = await supabase
          .from('time_entries')
          .delete()
          .eq('id', id)
        if (error) throw error
        await loadEntries()
      }
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const getEntriesByDate = useCallback((targetDate) => {
    if (USE_MOCK) {
      return mockEntries.filter(e => e.date === targetDate)
    }
    return entries.filter(e => e.date === targetDate)
  }, [entries])

  return { entries, loading, error, addEntry, updateEntry, deleteEntry, refresh: loadEntries, getEntriesByDate }
}
