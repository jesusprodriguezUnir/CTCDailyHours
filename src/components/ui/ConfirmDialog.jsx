import React from 'react'
import { AlertCircle } from 'lucide-react'

export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
    variant = 'danger' // danger, warning, infow
}) {
    if (!isOpen) return null

    const getVariantStyles = () => {
        switch (variant) {
            case 'danger':
                return {
                    icon: 'text-red-600 dark:text-red-400',
                    bg: 'bg-red-100 dark:bg-red-900/30',
                    button: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
                }
            case 'warning':
                return {
                    icon: 'text-yellow-600 dark:text-yellow-400',
                    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
                    button: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500'
                }
            default: // info
                return {
                    icon: 'text-blue-600 dark:text-blue-400',
                    bg: 'bg-blue-100 dark:bg-blue-900/30',
                    button: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                }
        }
    }

    const styles = getVariantStyles()

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div
                className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all"
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full flex-shrink-0 ${styles.bg}`}>
                        <AlertCircle className={`w-6 h-6 ${styles.icon}`} />
                    </div>

                    <div className="flex-1 mt-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {title}
                        </h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {message}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3 flex-row-reverse">
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors ${styles.button}`}
                    >
                        {confirmText}
                    </button>
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800 transition-colors"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    )
}
