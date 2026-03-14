import { vi } from 'vitest'
import {
  mockEmployee,
  mockAdmin,
  mockResponsible,
  mockWorkCenter,
  mockDepartment,
  mockCustomer,
  mockTask,
  mockTimeEntry
} from '../fixtures'

// Mock de createClient
export const supabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis()
}

// Reset mocks utility
export const resetSupabaseMocks = () => {
  Object.values(supabase).forEach(mockFn => {
    if (typeof mockFn.mockClear === 'function') {
      mockFn.mockClear()
    }
    // Restore default chainable behavior
    if (typeof mockFn.mockReturnThis === 'function') {
      mockFn.mockReturnThis()
    }
  })
}

// Named exports that match src/lib/supabase.js
export const fetchEmployees = vi.fn().mockResolvedValue([mockEmployee, mockAdmin, mockResponsible])
export const fetchWorkCenters = vi.fn().mockResolvedValue([mockWorkCenter])
export const fetchDepartments = vi.fn().mockResolvedValue([mockDepartment])
export const fetchCustomers = vi.fn().mockResolvedValue([mockCustomer])
export const fetchTimeEntries = vi.fn().mockResolvedValue([mockTimeEntry])

export const createTimeEntry = vi.fn().mockResolvedValue([mockTimeEntry])

export const createWorkCenter = vi.fn().mockResolvedValue(mockWorkCenter)
export const updateWorkCenter = vi.fn().mockResolvedValue(mockWorkCenter)
export const toggleWorkCenterActive = vi.fn().mockResolvedValue({ ...mockWorkCenter, active: false })
export const fetchAllWorkCenters = vi.fn().mockResolvedValue([mockWorkCenter])

export const createDepartment = vi.fn().mockResolvedValue(mockDepartment)
export const updateDepartment = vi.fn().mockResolvedValue(mockDepartment)
export const toggleDepartmentActive = vi.fn().mockResolvedValue({ ...mockDepartment, active: false })
export const fetchAllDepartments = vi.fn().mockResolvedValue([mockDepartment])

export const resetDatabase = vi.fn().mockResolvedValue({
  workCenters: 1,
  departments: 1,
  customers: 1,
  tasks: 1,
  employees: 3
})
