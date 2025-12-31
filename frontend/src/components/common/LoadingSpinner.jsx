import { FiLoader } from 'react-icons/fi';

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <FiLoader className={`${sizes[size]} animate-spin text-teal-600`} />
        </div>
    );
};

export const PageLoader = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-0">
        <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
    </div>
);

export default LoadingSpinner;
