import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useDepartments } from '../../hooks/useDepartments'

function getPasswordStrength(password) {
    if (!password) return null
    const hasLower = /[a-z]/.test(password)
    const hasUpper = /[A-Z]/.test(password)
    const hasDigit = /\d/.test(password)
    const hasSpecial = /[^a-zA-Z0-9]/.test(password)
    const variety = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length
    if (password.length < 4) return { label: 'Muy débil', barColor: 'bg-red-500', textColor: 'text-red-500', width: 'w-1/4' }
    if (password.length < 8 || variety < 2) return { label: 'Débil', barColor: 'bg-orange-400', textColor: 'text-orange-400', width: 'w-2/4' }
    if (password.length < 12 || variety < 3) return { label: 'Media', barColor: 'bg-yellow-400', textColor: 'text-yellow-500', width: 'w-3/4' }
    return { label: 'Fuerte', barColor: 'bg-green-500', textColor: 'text-green-600', width: 'w-full' }
}

function PasswordStrengthIndicator({ password }) {
    const strength = getPasswordStrength(password)
    if (!strength) return null
    return (
        <div className="mt-1">
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${strength.barColor} ${strength.width}`} />
            </div>
            <p className={`text-xs mt-0.5 ${strength.textColor}`}>{strength.label}</p>
        </div>
    )
}

export function EmployeeModal({
    isOpen,
    onClose,
    onSubmit,
    employee = null,
    saving = false
}) {
    const { departments } = useDepartments()

    const [formData, setFormData] = useState({
        name: '',
        role: 'employee',
        password: '',
        department_id: ''
    })

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: employee?.name || '',
                role: employee?.role || 'employee',
                password: '', // No mostrar contraseña actual
                department_id: employee?.department_id || employee?.department?.id || ''
            })
        } else {
            setFormData({ name: '', role: 'employee', password: '', department_id: '' })
        }
    }, [isOpen, employee])

    if (!isOpen) return null

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmitInternal = (e) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            toast.error('El nombre es requerido')
            return
        }

        if (!employee && !formData.password) {
            toast.error('La contraseña es requerida para nuevos empleados')
            return
        }

        if (!formData.department_id) {
            toast.error('El departamento es requerido')
            return
        }

        onSubmit({
            name: formData.name.trim(),
            role: formData.role,
            password: formData.password,
            department_id: parseInt(formData.department_id),
            isEditing: Boolean(employee),
            id: employee?.id
        })
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md transition-colors">
                <h3 className="text-xl font-bold mb-4 dark:text-white">
                    {employee ? 'Editar Empleado' : 'Nuevo Empleado'}
                </h3>

                <form onSubmit={handleSubmitInternal}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nombre Completo
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
                            placeholder="Ej: Juan Pérez García"
                            disabled={saving}
                            autoFocus
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Departamento
                        </label>
                        <select
                            name="department_id"
                            value={formData.department_id}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
                            disabled={saving}
                        >
                            <option value="">-- Seleccionar --</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.work_center?.name ? `${dept.work_center.name} - ` : ''}{dept.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Rol
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
                            disabled={saving}
                        >
                            <option value="employee">Empleado</option>
                            <option value="responsible">Responsable</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Contraseña {employee && '(dejar en blanco para no cambiar)'}
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
                            placeholder={employee ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                            disabled={saving}
                            autoComplete="new-password"
                        />
                        {formData.password && (
                            <PasswordStrengthIndicator password={formData.password} />
                        )}
                        {!employee && !formData.password && (
                            <p className="text-xs text-gray-500 mt-1">Mínimo 4 caracteres</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                            disabled={saving}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                            disabled={saving}
                        >
                            {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
