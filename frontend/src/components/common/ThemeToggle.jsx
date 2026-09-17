import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Laptop, CircleHalf } from '@phosphor-icons/react';
import useTheme from '../../hooks/useTheme';

export const ThemeToggle = ({ className = '', compact = false, sidebar = false }) => {
    const { theme, setTheme } = useTheme();

    if (sidebar) {
        const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
        const currentLabel = theme.charAt(0).toUpperCase() + theme.slice(1);
        return (
            <button
                type="button"
                onClick={() => setTheme(nextTheme)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#0c0d12] dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/[0.06] transition-colors focus-visible:ring-2 focus-visible:ring-primary focus:outline-none cursor-pointer ${className}`}
                title={`Theme: ${currentLabel} (Click to switch)`}
                aria-label={`Current theme: ${currentLabel}. Click to switch theme.`}
            >
                <div className="flex items-center gap-3">
                    <CircleHalf size={18} weight="regular" className="text-[#0c0d12] dark:text-gray-300" />
                    <span>Theme</span>
                </div>
            </button>
        );
    }

    if (compact) {
        const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
        const CurrentIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Laptop;
        const currentLabel = theme.charAt(0).toUpperCase() + theme.slice(1);
        return (
            <button
                type="button"
                onClick={() => setTheme(nextTheme)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors focus-visible:ring-2 focus-visible:ring-primary focus:outline-none relative group ${className}`}
                title={`Theme: ${currentLabel} (Click to switch)`}
                aria-label={`Current theme: ${currentLabel}. Click to switch theme.`}
            >
                <CurrentIcon size={18} weight="regular" />
                <div
                    role="tooltip"
                    className="absolute left-full ml-3 px-2.5 py-1 bg-gray-900 dark:bg-gray-800 text-white text-[12px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 shadow-lg z-50"
                >
                    Theme: {currentLabel}
                </div>
            </button>
        );
    }

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
                            <Icon size={14} weight="regular" />
                            <span className="hidden sm:inline text-[11px]">{label}</span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default ThemeToggle;
