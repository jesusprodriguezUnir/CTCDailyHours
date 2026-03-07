import React from 'react'
import { FileQuestion } from 'lucide-react'

export function EmptyState({
    icon: Icon = FileQuestion,
    title = 'No hay datos',
    description = 'No se encontraron resultados para mostrar en esta vista.',
    action = null
}) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <Icon className="w-10 h-10 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                {description}
            </p>
            {action && (
                <div>
                    {action}
                </div>
            )}
        </div>
    )
}
