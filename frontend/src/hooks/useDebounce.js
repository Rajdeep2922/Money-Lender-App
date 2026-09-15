import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * Debounces a fast-changing value (such as search keystrokes)
 * 
 * @param {any} value - The input value to debounce
 * @param {number} delay - Delay in milliseconds (default 300ms)
 * @returns {any} Debounced value
 */
export const useDebounce = (value, delay = 300) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
};

export default useDebounce;
