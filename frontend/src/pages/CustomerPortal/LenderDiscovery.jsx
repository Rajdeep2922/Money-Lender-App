import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { lenderDiscoveryAPI } from '../../services/api';
import LenderCard from '../../components/lenders/LenderCard';
import LoanRequestForm from './LoanRequestForm';
import { useDebounce } from '../../hooks/useDebounce';
import { FiSearch, FiAlertCircle } from 'react-icons/fi';

/**
 * LenderDiscovery — Customer browses all available lenders
 */
const LenderDiscovery = () => {
    const [selectedLender, setSelectedLender] = useState(null);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 250);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['lenders-discovery'],
        queryFn: () => lenderDiscoveryAPI.getAll().then((r) => r.data.data),
        staleTime: 5 * 60_000,
    });

    const lenders = data || [];
    const filtered = lenders.filter(
        (l) =>
            !debouncedSearch ||
            l.businessName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            l.ownerName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            l.address?.city?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Find a Lender</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Browse verified lenders, compare competitive interest rates, and apply for financing directly.
                </p>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by lender, owner, or city…"
                    className="w-full bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary transition-colors shadow-xs"
                />
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl h-64 animate-pulse shadow-xs" />
                    ))}
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl">
                    <span className="text-3xl">⚠️</span>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Failed to load verified lenders.</p>
                    <button
                        onClick={refetch}
                        className="text-primary hover:text-primary-hover text-sm font-medium underline underline-offset-4"
                    >
                        Try again
                    </button>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl">
                    <FiAlertCircle className="w-10 h-10 text-gray-400 mb-1" />
                    <p className="text-gray-900 dark:text-white font-medium text-base">No lenders found{search ? ` matching "${search}"` : ''}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Try adjusting your search terms or city filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((lender) => (
                        <LenderCard
                            key={lender._id}
                            lender={lender}
                            onSelect={setSelectedLender}
                        />
                    ))}
                </div>
            )}

            {/* Loan Request Modal */}
            {selectedLender && (
                <LoanRequestForm
                    lender={selectedLender}
                    onClose={() => setSelectedLender(null)}
                />
            )}
        </div>
    );
};

export default LenderDiscovery;
