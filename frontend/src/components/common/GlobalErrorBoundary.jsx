import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FiAlertTriangle } from 'react-icons/fi';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiAlertTriangle className="w-8 h-8 text-red-600 dark:text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Something went wrong
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {error.message || 'An unexpected error occurred. Please try again.'}
                </p>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-secondary"
                    >
                        Reload Page
                    </button>
                    <button
                        onClick={resetErrorBoundary}
                        className="btn btn-primary"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );
};

export const GlobalErrorBoundary = ({ children }) => {
    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => {
                // Reset the state of your app so the error doesn't happen again
                window.location.href = '/';
            }}
        >
            {children}
        </ErrorBoundary>
    );
};
