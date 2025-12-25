import { useEffect, useState } from 'react';

/**
 * Hook to detect if user prefers reduced motion or is on mobile
 * Returns true if animations should be reduced
 */
export const useReducedMotion = () => {
    const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

    useEffect(() => {
        // Check for reduced motion preference
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        // Check if mobile device (screen width < 768px)
        const isMobile = window.innerWidth < 768;

        setShouldReduceMotion(mediaQuery.matches || isMobile);

        const handleChange = (e) => {
            setShouldReduceMotion(e.matches || window.innerWidth < 768);
        };

        const handleResize = () => {
            setShouldReduceMotion(mediaQuery.matches || window.innerWidth < 768);
        };

        mediaQuery.addEventListener('change', handleChange);
        window.addEventListener('resize', handleResize);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return shouldReduceMotion;
};

/**
 * Get optimized animation variants based on device
 * Returns simplified variants for mobile, full variants for desktop
 */
export const getOptimizedVariants = (shouldReduceMotion) => {
    if (shouldReduceMotion) {
        return {
            container: {
                hidden: { opacity: 1 },
                visible: { opacity: 1 },
            },
            item: {
                hidden: { opacity: 1 },
                visible: { opacity: 1 },
            },
        };
    }

    return {
        container: {
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
            },
        },
        item: {
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
        },
    };
};
