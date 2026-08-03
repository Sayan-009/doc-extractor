import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = React.forwardRef(({
  label,
  error,
  icon: Icon,
  className = '',
  id,
  type,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const isPassword = type === 'password';
  const [showPassword, setShowPassword] = useState(false);

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          className={`block w-full rounded-md sm:text-sm transition-colors
            ${Icon ? 'pl-10' : 'pl-3'} ${isPassword ? 'pr-10' : 'pr-3'} py-2
            ${error 
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
            }
            border shadow-sm focus:outline-none focus:ring-2`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
