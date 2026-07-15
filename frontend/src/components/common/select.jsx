// Select reutilizable compatible con react-hook-form
import { forwardRef } from 'react'

const Select = forwardRef(function Select({ label, error, id, children, className = '', ...props }, ref) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        id={inputId}
        ref={ref}
        className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm
          focus:outline-none focus:ring-2 bg-white
          ${error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-orange-400'}
          ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
})

export default Select
