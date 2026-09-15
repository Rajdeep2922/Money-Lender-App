import { useState, useEffect } from 'react';

const THEME_STORAGE_KEY = 'money-lender-theme';

export const useTheme = () => {
    // 'light' | 'dark' | 'system' - defaults to 'dark'
    const [theme, setThemeState] = useState(() => {
        try {
            return localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
        } catch {
            return 'dark';
        }
    });

    const setTheme = (newTheme) => {
        setThemeState(newTheme);
        try {
            localStorage.setItem(THEME_STORAGE_KEY, newTheme);
            window.dispatchEvent(new CustomEvent('theme-change', { detail: newTheme }));
        } catch (e) {
            console.error('Failed to save theme to localStorage:', e);
        }
    };

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

        const handleCustomChange = (e) => {
            if (e.detail && e.detail !== theme) {
                setThemeState(e.detail);
            }
        };
        const handleStorageChange = (e) => {
            if (e.key === THEME_STORAGE_KEY && e.newValue && e.newValue !== theme) {
                setThemeState(e.newValue);
            }
        };

        window.addEventListener('theme-change', handleCustomChange);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
            window.removeEventListener('theme-change', handleCustomChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [theme]);

    return { theme, setTheme };
};

export default useTheme;

