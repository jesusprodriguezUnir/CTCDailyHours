import React from 'react'

export function Skeleton({ className = '', variant = 'rectangular', ...props }) {
    const baseClasses = 'bg-gray-200 dark:bg-gray-700 animate-pulse'

    const variantClasses = {
        rectangular: 'rounded-md',
        circular: 'rounded-full',
        text: 'rounded-sm h-4 w-full'
    }

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            {...props}
        />
    )
}
