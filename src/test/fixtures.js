export const mockWorkCenter = {
  id: 1,
  name: 'Centro Base',
  code: 'CB',
  active: true
}

export const mockDepartment = {
  id: 1,
  name: 'Logística',
  code: 'LOG',
  active: true,
  work_center_id: 1,
  work_center: mockWorkCenter
}

export const mockEmployee = {
  id: 2,
  name: 'Juan Perez',
  role: 'employee',
  active: true,
  department_id: 1,
  department: mockDepartment
}

export const mockAdmin = {
  id: 1,
  name: 'Admin User',
  role: 'admin',
  active: true,
  department_id: 1,
  department: mockDepartment
}

export const mockResponsible = {
  id: 3,
  name: 'Jefe Operations',
  role: 'responsible',
  active: true,
  department_id: 1,
  department: mockDepartment
}

export const mockCustomer = {
  id: 1,
  name: 'Cliente Importante',
  code: 'C_IMP',
  active: true
}

export const mockTask = {
  id: 1,
  name: 'Descarga de Material',
  is_customer_service: true,
  customer_id: 1,
  active: true,
  customer: mockCustomer
}

export const mockTimeEntry = {
  id: 1,
  date: '2023-10-25',
  hours: 4.5,
  employee_id: 2,
  task_id: 1,
  created_at: '2023-10-25T10:00:00Z',
  employee: mockEmployee,
  task: mockTask
}
