import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
              w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white
              text-slate-900 placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500
              disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
              transition-all duration-200
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}
              ${className}
            `}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1.5 text-sm text-red-500">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={`
            w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white
            text-slate-900 placeholder-slate-400 resize-none
            focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            transition-all duration-200
            ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}
            ${className}
          `}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-red-500">{error}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    className={`
            w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white
            text-slate-900
            focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            transition-all duration-200 cursor-pointer
            ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}
            ${className}
          `}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p className="mt-1.5 text-sm text-red-500">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';
