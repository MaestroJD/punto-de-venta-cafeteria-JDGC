// Input reutilizable compatible con react-hook-form
import { forwardRef } from 'react'

const Input = forwardRef(function Input({ label, error, id, className = '', ...props }, ref) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm
          focus:outline-none focus:ring-2
          ${error
            ? 'border-red-400 focus:ring-red-400 bg-red-50'
            : 'border-gray-300 focus:ring-orange-400 bg-white'}
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
})

export default Input
