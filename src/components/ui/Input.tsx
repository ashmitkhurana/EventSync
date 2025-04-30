import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label, 
    error, 
    leftIcon, 
    rightIcon, 
    type = 'text',
    wrapperClassName,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={cn('w-full', wrapperClassName)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400">{leftIcon}</span>
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            className={cn(
              'block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm',
              'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
              'border py-2 px-3',
              error ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : '',
              leftIcon ? 'pl-10' : '',
              rightIcon || isPasswordType ? 'pr-10' : '',
              className
            )}
            {...props}
          />
          
          {(rightIcon || isPasswordType) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {isPasswordType ? (
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-gray-500 dark:text-gray-400 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff size={18} className="h-5 w-5" />
                  ) : (
                    <Eye size={18} className="h-5 w-5" />
                  )}
                </button>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">{rightIcon}</span>
              )}
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-error-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;