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
    .select(`
      *,
      department:departments(
        id,
        name,
        code,
        work_center:work_centers(id, name, code)
      )
    `)
    .eq('active', true)
    .order('name')
  
  if (error) throw error
  return data
}

export async function fetchWorkCenters() {
  const { data, error } = await supabase
    .from('work_centers')
    .select('*')
    .eq('active', true)
    .order('name')

  if (error) throw error
  return data
}

export async function fetchDepartments(workCenterId = null) {
  let query = supabase
    .from('departments')
    .select(`
      *,
      work_center:work_centers(id, name, code)
    `)
    .eq('active', true)
    .order('name')

  if (workCenterId) {
    query = query.eq('work_center_id', workCenterId)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function fetchCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('active', true)
    .order('name')

  if (error) throw error
  return data
}

export async function fetchTimeEntries(date = null, employeeId = null) {
  let query = supabase
    .from('time_entries')
    .select(`
      *,
      employee:employees(
        id,
        name,
        role,
        department:departments(
          id,
          name,
          code,
          work_center:work_centers(id, name, code)
        )
      ),
      task:tasks(
        id,
        name,
        is_customer_service,
        customer:customers(id, name, code)
      )
    `)
    .order('created_at', { ascending: false })

  if (date) {
    query = query.eq('date', date)
  }

  if (employeeId) {
    query = query.eq('employee_id', employeeId)
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

// ========== WORK CENTERS CRUD ==========

export async function createWorkCenter(workCenter) {
  const { data, error } = await supabase
    .from('work_centers')
    .insert([{ 
      name: workCenter.name,
      code: workCenter.code,
      active: true 
    }])
    .select()
  
  if (error) throw error
  return data[0]
}

export async function updateWorkCenter(id, updates) {
  const { data, error } = await supabase
    .from('work_centers')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export async function toggleWorkCenterActive(id) {
  const { data: current, error: fetchError } = await supabase
    .from('work_centers')
    .select('active')
    .eq('id', id)
    .single()
  
  if (fetchError) throw fetchError

  const { data, error } = await supabase
    .from('work_centers')
    .update({ active: !current.active })
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export async function fetchAllWorkCenters() {
  const { data, error } = await supabase
    .from('work_centers')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

// ========== DEPARTMENTS CRUD ==========

export async function createDepartment(department) {
  const { data, error } = await supabase
    .from('departments')
    .insert([{ 
      work_center_id: department.work_center_id,
      name: department.name,
      code: department.code,
      active: true 
    }])
    .select(`
      *,
      work_center:work_centers(id, name, code)
    `)
  
  if (error) throw error
  return data[0]
}

export async function updateDepartment(id, updates) {
  const { data, error } = await supabase
    .from('departments')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      work_center:work_centers(id, name, code)
    `)
  
  if (error) throw error
  return data[0]
}

export async function toggleDepartmentActive(id) {
  const { data: current, error: fetchError } = await supabase
    .from('departments')
    .select('active')
    .eq('id', id)
    .single()
  
  if (fetchError) throw fetchError

  const { data, error } = await supabase
    .from('departments')
    .update({ active: !current.active })
    .eq('id', id)
    .select(`
      *,
      work_center:work_centers(id, name, code)
    `)
  
  if (error) throw error
  return data[0]
}

export async function fetchAllDepartments(workCenterId = null) {
  let query = supabase
    .from('departments')
    .select(`
      *,
      work_center:work_centers(id, name, code)
    `)
    .order('name')

  if (workCenterId) {
    query = query.eq('work_center_id', workCenterId)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}
