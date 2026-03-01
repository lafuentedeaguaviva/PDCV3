import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from './atoms';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, icon, ...props }, ref) => {
        return (
            <div className="space-y-2 w-full group/field">
                {label && (
                    <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-widest group-focus-within/field:text-primary transition-colors">
                        {label}
                    </label>
                )}
                <div className="relative group/input shadow-sm rounded-xl overflow-hidden">
                    {icon && (
                        <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-primary transition-all pointer-events-none text-lg">
                            {icon}
                        </span>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            'w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-4 text-sm font-bold text-slate-900 transition-all duration-300',
                            'placeholder:text-slate-300 placeholder:font-medium focus:ring-0 focus:border-primary focus:bg-white outline-none',
                            'hover:border-slate-200',
                            icon ? 'pl-12' : 'pl-5',
                            className
                        )}
                        {...props}
                    />
                </div>
            </div>
        );
    }
);

Input.displayName = 'Input';
