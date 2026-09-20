import React from 'react';

/**
 * LoadingSpinner Component
 * Built from Uiverse.io by Shoh2008 — Rotating Geometric Star Loader
 *
 * @param {Object} props
 * @param {'sm'|'md'|'lg'} [props.size='md'] Size of the loader
 * @param {string} [props.className=''] Additional class names
 */
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
    // Scales:
    // sm: 0.5 (24px)
    // md: 0.75 (36px)
    // lg: 1.0 (48px)
    const scales = {
        sm: 0.5,
        md: 0.75,
        lg: 1.0,
    };

    const currentScale = scales[size] || 0.75;
    const dimension = Math.round(48 * currentScale);

    return (
        <div
            className={`inline-flex items-center justify-center select-none ${className}`}
            style={{ width: `${dimension}px`, height: `${dimension}px` }}
            role="status"
            aria-label="Loading..."
        >
            <div
                style={{
                    transform: `scale(${currentScale})`,
                    transformOrigin: 'center center',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {/* From Uiverse.io by Shoh2008 */}
                <span className="loader !m-0"></span>
            </div>
        </div>
    );
};

export const PageLoader = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-black transition-colors duration-200">
        <div className="flex flex-col items-center justify-center">
            <LoadingSpinner size="lg" />
            <p className="mt-5 text-sm font-medium tracking-wide text-gray-600 dark:text-gray-400 animate-pulse">
                Loading...
            </p>
        </div>
    </div>
);

export default LoadingSpinner;
