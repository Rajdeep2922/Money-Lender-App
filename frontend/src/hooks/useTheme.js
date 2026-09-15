import { useState, useEffect } from 'react';

const THEME_STORAGE_KEY = 'money-lender-theme';

export const useTheme = () => {
    // 'light' | 'dark' | 'system'
    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem(THEME_STORAGE_KEY) || 'system';
        } catch {
            return 'system';
        }
    });

    useEffect(() => {
        const root = document.documentElement;

        const applyTheme = () => {
            let isDark = false;
            if (theme === 'dark') {
                isDark = true;
            } else if (theme === 'light') {
                isDark = false;
            } else {
                // system
                isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            }

            root.classList.toggle('dark', isDark);
        };

        applyTheme();

        // Listen to system preference changes if in 'system' mode
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                applyTheme();
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch (e) {
            console.error('Failed to save theme to localStorage:', e);
        }

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    return { theme, setTheme };
};

export default useTheme;
