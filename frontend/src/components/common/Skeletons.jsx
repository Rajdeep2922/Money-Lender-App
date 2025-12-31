import React from 'react';

// Base shimmer effect using CSS animation (already defined in index.css)
const Shimmer = ({ className = "", children }) => (
    <div className={`animate-pulse ${className}`}>
        {children}
    </div>
);

export const TableSkeleton = ({ columns = 5, rows = 5 }) => {
    return (
        <div className="card overflow-hidden">
            <Shimmer>
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                {[...Array(columns)].map((_, i) => (
                                    <th key={i} className="py-4 px-4">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full max-w-[120px]"></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {[...Array(rows)].map((_, i) => (
                                <tr key={i}>
                                    {[...Array(columns)].map((_, j) => (
                                        <td key={j} className="py-4 px-4">
                                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Shimmer>
        </div>
    );
};

export const CardSkeleton = ({ count = 3 }) => {
    return (
        <div className="grid grid-cols-1 gap-4">
            {[...Array(count)].map((_, i) => (
                <Shimmer key={i}>
                    <div className="card p-4 sm:p-6 space-y-3">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2 flex-1">
                                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 max-w-[200px]"></div>
                                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2 max-w-[150px]"></div>
                            </div>
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                        </div>
                        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4"></div>
                        </div>
                    </div>
                </Shimmer>
            ))}
        </div>
    );
};

// Dashboard Stats Skeleton
export const StatCardSkeleton = ({ count = 4 }) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(count)].map((_, i) => (
                <Shimmer key={i}>
                    <div className="card p-4 sm:p-6 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-20"></div>
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                            </div>
                        </div>
                    </div>
                </Shimmer>
            ))}
        </div>
    );
};

// List Skeleton (for payments, loans list)
export const ListSkeleton = ({ rows = 5 }) => {
    return (
        <div className="card divide-y divide-gray-200 dark:divide-gray-700">
            {[...Array(rows)].map((_, i) => (
                <Shimmer key={i}>
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                            <div className="h-8 w-8 bg-gray-100 dark:bg-gray-800 rounded"></div>
                        </div>
                    </div>
                </Shimmer>
            ))}
        </div>
    );
};

// Form Skeleton
export const FormSkeleton = () => {
    return (
        <Shimmer>
            <div className="card p-6 space-y-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
                    </div>
                ))}
                <div className="flex justify-end gap-3 pt-4">
                    <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded w-24"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                </div>
            </div>
        </Shimmer>
    );
};
