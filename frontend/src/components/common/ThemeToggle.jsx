import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Laptop } from 'lucide-react';
import useTheme from '../../hooks/useTheme';

export const ThemeToggle = ({ className = '' }) => {
    const { theme, setTheme } = useTheme();

    const options = [
        { id: 'light', label: 'Light', icon: Sun },
        { id: 'system', label: 'System', icon: Laptop },
        { id: 'dark', label: 'Dark', icon: Moon },
    ];

    return (
        <div
            className={`inline-flex items-center p-1 rounded-full bg-gray-100 dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark transition-colors ${className}`}
            role="radiogroup"
            aria-label="Select theme"
        >
            {options.map(({ id, label, icon: Icon }) => {
                const isActive = theme === id;
                return (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setTheme(id)}
                        className={`relative px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 flex items-center justify-center ${
                            isActive
                                ? 'text-primary dark:text-primary-bright font-semibold'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                        title={`${label} Mode`}
                        aria-checked={isActive}
                        role="radio"
                    >
                        {isActive && (
                            <motion.div
                                layoutId="theme-toggle-active"
                                className="absolute inset-0 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-hairline-light dark:border-hairline-dark"
                                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-1">
                            <Icon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-[11px]">{label}</span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default ThemeToggle;
