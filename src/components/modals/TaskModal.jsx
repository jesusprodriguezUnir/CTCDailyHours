import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useCustomers } from '../../hooks/useCustomers'
import { supabase } from '../../lib/supabase' // Si el hook update usa supabase directamente y queremos mantener la misma forma, o mejor usar useTasks del padre

export function TaskModal({
    isOpen,
    onClose,
    onSubmit,
    task = null,
    saving = false
}) {
    const { customers } = useCustomers()

    const [taskName, setTaskName] = useState('')
    const [isCustomerService, setIsCustomerService] = useState(false)
    const [customerId, setCustomerId] = useState('')

    // Sincronizar estado cuando se abre/cierra o cambia la tarea a editar
    useEffect(() => {
        if (isOpen) {
            setTaskName(task?.name || '')
            setIsCustomerService(Boolean(task?.is_customer_service))
            setCustomerId(task?.customer_id ? String(task.customer_id) : '')
        } else {
            // Limpiar al cerrar
            setTaskName('')
            setIsCustomerService(false)
            setCustomerId('')
        }
    }, [isOpen, task])

    if (!isOpen) return null

    const handleSubmitInternal = (e) => {
        e.preventDefault()

        if (!taskName.trim()) {
            toast.error('El nombre de la tarea es requerido')
            return
        }

        const parsedCustomerId = isCustomerService && customerId ? parseInt(customerId, 10) : null
        if (parsedCustomerId !== null && isNaN(parsedCustomerId)) {
            toast.error('El ID del cliente no es válido')
            return
        }

        onSubmit({
            name: taskName.trim(),
            is_customer_service: isCustomerService,
            customer_id: parsedCustomerId,
            isEditing: Boolean(task),
            id: task?.id
        })
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md transition-colors">
                <h3 className="text-xl font-bold mb-4 dark:text-white">
                    {task ? 'Editar Tarea' : 'Nueva Tarea'}
                </h3>

                <form onSubmit={handleSubmitInternal}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nombre de la Tarea
                        </label>
                        <input
                            type="text"
                            value={taskName}
                            onChange={(e) => setTaskName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
                            placeholder="Ej: Clasificación de materiales"
                            disabled={saving}
                            autoFocus
                        />
                    </div>

                    <div className="mb-4">
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <input
                                type="checkbox"
                                checked={isCustomerService}
                                onChange={(e) => {
                                    const checked = e.target.checked
                                    setIsCustomerService(checked)
                                    if (!checked) {
                                        setCustomerId('')
                                    }
                                }}
                                className="rounded"
                            />
                            Es asistencia al cliente
                        </label>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Cliente (opcional)
                        </label>
                        <select
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
                            disabled={saving || !isCustomerService}
                        >
                            <option value="">-- Sin cliente --</option>
                            {customers.map(customer => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name}
                                </option>
                            ))}
                        </select>
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
