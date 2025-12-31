import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * SkeletonWrapper - Prevents skeleton flash for very fast loads
 * 
 * Features:
 * - Minimum display time (prevents <100ms flashes)
 * - Smooth fade transitions
 * - No layout shift during transition
 */
export const SkeletonWrapper = ({
    isLoading,
    skeleton,
    children,
    minDisplayTime = 300, // Minimum time to show skeleton (ms)
    fadeDelay = 150 // Delay before fading in content (ms)
}) => {
    const [showSkeleton, setShowSkeleton] = useState(isLoading);
    const [startTime, setStartTime] = useState(null);

    useEffect(() => {
        if (isLoading) {
            // Started loading - record time and show skeleton
            setStartTime(Date.now());
            setShowSkeleton(true);
        } else if (startTime) {
            // Finished loading - check if minimum time has elapsed
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, minDisplayTime - elapsed);

            if (remaining > 0) {
                // Wait for remaining time before hiding skeleton
                const timeout = setTimeout(() => {
                    setShowSkeleton(false);
                    setStartTime(null);
                }, remaining);
                return () => clearTimeout(timeout);
            } else {
                // Minimum time already passed
                setShowSkeleton(false);
                setStartTime(null);
            }
        }
    }, [isLoading, startTime, minDisplayTime]);

    return (
        <AnimatePresence mode="wait">
            {showSkeleton ? (
                <motion.div
                    key="skeleton"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {skeleton}
                </motion.div>
            ) : (
                <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: fadeDelay / 1000 }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SkeletonWrapper;
