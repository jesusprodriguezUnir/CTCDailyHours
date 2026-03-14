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
  // The employee->department->work_center and task->customer joins are required
  // for export functions (exportHelpers.js) to populate Centro, Departamento and Cliente fields.
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

// ========== DATABASE RESET (admin only) ==========

/**
 * Borra todos los datos y los re-inserta desde el objeto `data` del Excel.
 * Orden de borrado respetando las foreign keys:
 *   time_entries → employees → tasks → customers → departments → work_centers
 * Orden de inserción inverso.
 * @param {Object} data - { workCenters, departments, customers, tasks, employees }
 */
export async function resetDatabase(data) {
  const { workCenters, departments, customers, tasks, employees } = data

  // ---- 1. BORRAR en orden (FK-safe) ----
  const deleteSteps = [
    supabase.from('time_entries').delete().neq('id', 0),
    supabase.from('employees').delete().neq('id', 0),
    supabase.from('tasks').delete().neq('id', 0),
    supabase.from('customers').delete().neq('id', 0),
    supabase.from('departments').delete().neq('id', 0),
    supabase.from('work_centers').delete().neq('id', 0),
  ]
  for (const step of deleteSteps) {
    const { error } = await step
    if (error) throw error
  }

  // ---- 2. INSERTAR work_centers ----
  const { data: insertedCenters, error: wcError } = await supabase
    .from('work_centers')
    .insert(workCenters.map(c => ({ name: c.name, code: c.code, active: c.active })))
    .select()
  if (wcError) throw wcError

  // Mapa code → id (para resolver dependencias)
  const centerMap = {}
  insertedCenters.forEach(c => { centerMap[c.code] = c.id })

  // ---- 3. INSERTAR departments ----
  const deptRows = departments.map(d => ({
    name: d.name,
    code: d.code,
    active: d.active,
    work_center_id: centerMap[d.work_center_code],
  }))
  const { data: insertedDepts, error: deptError } = await supabase
    .from('departments')
    .insert(deptRows)
    .select()
  if (deptError) throw deptError

  // Mapa (centerCode+deptCode) → id
  const deptMap = {}
  insertedDepts.forEach((d, i) => {
    const key = `${deptRows[i].work_center_id}_${d.code}`
    deptMap[key] = d.id
  })
  // También mapa simple por code para búsquedas rápidas
  const deptByCode = {}
  insertedDepts.forEach((d, i) => {
    const wcId = deptRows[i].work_center_id
    if (!deptByCode[wcId]) deptByCode[wcId] = {}
    deptByCode[wcId][d.code] = d.id
  })

  // ---- 4. INSERTAR customers ----
  const { data: insertedCustomers, error: custError } = await supabase
    .from('customers')
    .insert(customers.map(c => ({ name: c.name, code: c.code, active: c.active })))
    .select()
  if (custError) throw custError

  const customerMap = {}
  insertedCustomers.forEach(c => { customerMap[c.code] = c.id })

  // ---- 5. INSERTAR tasks ----
  const taskRows = tasks.map(t => ({
    name: t.name,
    is_customer_service: t.is_customer_service,
    customer_id: t.customer_code ? (customerMap[t.customer_code] ?? null) : null,
    active: t.active,
  }))
  const { data: insertedTasks, error: taskError } = await supabase
    .from('tasks')
    .insert(taskRows)
    .select()
  if (taskError) throw taskError

  // ---- 6. INSERTAR employees ----
  const employeeRows = employees.map(e => {
    const wcId = centerMap[e.work_center_code]
    const deptId = wcId && deptByCode[wcId] ? deptByCode[wcId][e.department_code] : null
    return {
      name: e.name,
      role: e.role,
      password: e.password,
      department_id: deptId,
      active: e.active,
    }
  })
  const { error: empError } = await supabase
    .from('employees')
    .insert(employeeRows)
  if (empError) throw empError

  return {
    workCenters: insertedCenters.length,
    departments: insertedDepts.length,
    customers: insertedCustomers.length,
    tasks: insertedTasks.length,
    employees: employeeRows.length,
  }
}
