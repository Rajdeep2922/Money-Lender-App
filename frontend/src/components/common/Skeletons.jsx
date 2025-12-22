import React from 'react';

export const TableSkeleton = ({ columns = 5, rows = 5 }) => {
    return (
        <div className="card overflow-hidden animate-pulse">
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            {[...Array(columns)].map((_, i) => (
                                <th key={i}>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {[...Array(rows)].map((_, i) => (
                            <tr key={i}>
                                {[...Array(columns)].map((_, j) => (
                                    <td key={j}>
                                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const CardSkeleton = ({ count = 3 }) => {
    return (
        <div className="grid grid-cols-1 gap-4">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="card p-4 space-y-3 animate-pulse">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-24"></div>
                        </div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between">
                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-48"></div>
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};
