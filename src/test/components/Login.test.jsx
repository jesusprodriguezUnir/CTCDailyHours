import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Login } from '../../components/Login'
import { useEmployees } from '../../hooks/useEmployees'
import { mockEmployee, mockAdmin, mockResponsible } from '../fixtures'

import { toast } from 'sonner'

// Mock the hook that Login uses
vi.mock('../../hooks/useEmployees', () => ({
  useEmployees: vi.fn()
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: { error: vi.fn() }
}))

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra loader mientras carga', () => {
    useEmployees.mockReturnValue({ employees: [], loading: true })
    render(<Login onLogin={vi.fn()} />)
    
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('renderiza el formulario con usuarios correctos', () => {
    useEmployees.mockReturnValue({
      employees: [mockEmployee, mockAdmin, mockResponsible],
      loading: false
    })
    render(<Login onLogin={vi.fn()} />)
    
    expect(screen.getByText('CTC Daily Hours')).toBeInTheDocument()
    // Select debe tener 3 opciones + la default
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(4)
    expect(screen.getByText('Juan Perez')).toBeInTheDocument()
    expect(screen.getByText('Admin User 🔴 (Admin)')).toBeInTheDocument()
    expect(screen.getByText('Jefe Operations 🟡 (Responsable)')).toBeInTheDocument()
  })

  it('muestra error si se guarda sin usuario ni contraseña', () => {
    useEmployees.mockReturnValue({ employees: [mockEmployee], loading: false })
    
    render(<Login onLogin={vi.fn()} />)
    fireEvent.click(screen.getByText('Iniciar Sesión'))
    
    expect(toast.error).toHaveBeenCalledWith('Selecciona usuario e introduce contraseña')
  })

  it('muestra error si la contraseña es incorrecta', () => {
    useEmployees.mockReturnValue({
      employees: [{ ...mockEmployee, password: 'correcta' }],
      loading: false
    })
    const onLogin = vi.fn()
    
    render(<Login onLogin={onLogin} />)
    
    // Seleccionar usuario
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: mockEmployee.id.toString() } })
    
    // Contraseña equivocada
    const passwordInput = screen.getByPlaceholderText('Introduce tu contraseña')
    fireEvent.change(passwordInput, { target: { value: 'equivocada' } })
    
    fireEvent.click(screen.getByText('Iniciar Sesión'))
    
    expect(toast.error).toHaveBeenCalledWith('Contraseña incorrecta')
    expect(onLogin).not.toHaveBeenCalled()
  })

  it('llama onSuccess con el empleado si todo es correcto', () => {
    const empleado = { ...mockEmployee, password: 'correcta' }
    useEmployees.mockReturnValue({ employees: [empleado], loading: false })
    const onLogin = vi.fn()
    
    render(<Login onLogin={onLogin} />)
    
    fireEvent.change(screen.getByRole('combobox'), { target: { value: empleado.id.toString() } })
    fireEvent.change(screen.getByPlaceholderText('Introduce tu contraseña'), { target: { value: 'correcta' } })
    fireEvent.click(screen.getByText('Iniciar Sesión'))
    
    expect(onLogin).toHaveBeenCalledWith(empleado)
  })
})
