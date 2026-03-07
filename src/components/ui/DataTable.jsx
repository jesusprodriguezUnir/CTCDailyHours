import React from 'react'
import { Skeleton } from './Skeleton'
import { EmptyState } from './EmptyState'

export function DataTable({
    columns,
    data,
    loading = false,
    emptyMessage = "No hay datos para mostrar",
    emptyIcon = undefined
}) {
    // Generate a default number of skeleton rows if no data is present yet
    const skeletonRowsCount = data && data.length > 0 ? data.length : 5

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm transition-colors">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900 transition-colors">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${column.align === 'right' ? 'text-right' :
                                            column.align === 'center' ? 'text-center' : 'text-left'
                                        } ${column.className || ''}`}
                                    style={column.style}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors">
                        {loading ? (
                            Array.from({ length: skeletonRowsCount }).map((_, rowIndex) => (
                                <tr key={`skeleton-row-${rowIndex}`}>
                                    {columns.map((column, colIndex) => (
                                        <td key={`skeleton-cell-${colIndex}`} className="px-6 py-4 whitespace-nowrap">
                                            <Skeleton variant="text" className="w-full max-w-[80%]" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-0 py-0">
                                    <EmptyState
                                        title={emptyMessage}
                                        description=""
                                        {...(emptyIcon && { icon: emptyIcon })}
                                    />
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIndex) => (
                                <tr
                                    key={row.id || rowIndex}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {columns.map((column, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className={`px-6 py-4 whitespace-nowrap ${column.align === 'right' ? 'text-right' :
                                                    column.align === 'center' ? 'text-center' : 'text-left'
                                                } ${column.cellClassName || ''}`}
                                        >
                                            {column.cell ? column.cell(row) : row[column.accessorKey]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
