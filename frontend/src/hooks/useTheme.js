import { useState, useEffect } from 'react';

const THEME_STORAGE_KEY = 'money-lender-theme';

export const useTheme = () => {
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('dark');
        try {
            localStorage.removeItem('money-lender-theme');
        } catch (e) {}
    }, []);

    return { theme: 'light', setTheme: () => {} };
};

export default useTheme;

