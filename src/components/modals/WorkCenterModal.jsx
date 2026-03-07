import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export function WorkCenterModal({
    isOpen,
    onClose,
    onSubmit,
    center = null,
    saving = false
}) {
    const [formData, setFormData] = useState({
        name: '',
        code: ''
    })

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: center?.name || '',
                code: center?.code || ''
            })
        } else {
            setFormData({ name: '', code: '' })
        }
    }, [isOpen, center])

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

        if (!formData.code.trim()) {
            toast.error('El código es requerido')
            return
        }

        onSubmit({
            name: formData.name.trim(),
            code: formData.code.trim().toUpperCase(),
            isEditing: Boolean(center),
            id: center?.id
        })
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md transition-colors">
                <h3 className="text-xl font-bold mb-4 dark:text-white">
                    {center ? 'Editar Centro de Trabajo' : 'Nuevo Centro de Trabajo'}
                </h3>

                <form onSubmit={handleSubmitInternal}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nombre *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
                                placeholder="Ej: Madrid"
                                disabled={saving}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Código *
                            </label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 uppercase transition-colors"
                                placeholder="Ej: MAD"
                                maxLength="10"
                                disabled={saving}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Código único para identificar el centro
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            disabled={saving}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                            disabled={saving}
                        >
                            {saving ? 'Guardando...' : center ? 'Actualizar' : 'Crear'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
