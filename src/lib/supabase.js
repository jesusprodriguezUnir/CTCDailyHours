import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Copy .env.example to .env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function fetchEmployees() {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('active', true)
    .order('name')
  
  if (error) throw error
  return data
}

export async function fetchTimeEntries(date = null) {
  let query = supabase
    .from('time_entries')
    .select(`
      *,
      employee:employees(name, role),
      task:tasks(name)
    `)
    .order('created_at', { ascending: false })

  if (date) {
    query = query.eq('date', date)
  }

  const { data, error } = await query
  
  if (error) throw error
  return data
}

export async function createTimeEntry(entry) {
  const { data, error } = await supabase
    .from('time_entries')
    .insert([entry])
    .select()
  
  if (error) throw error
  return data
}
