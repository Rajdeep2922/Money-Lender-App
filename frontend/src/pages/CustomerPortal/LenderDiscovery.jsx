import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { lenderDiscoveryAPI } from '../../services/api';
import LenderCard from '../../components/lenders/LenderCard';
import LoanRequestForm from './LoanRequestForm';

/**
 * LenderDiscovery — Customer browses all available lenders
 */
const LenderDiscovery = () => {
    const [selectedLender, setSelectedLender] = useState(null);
    const [search, setSearch] = useState('');

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['lenders-discovery'],
        queryFn: () => lenderDiscoveryAPI.getAll().then((r) => r.data.data),
        staleTime: 5 * 60_000,
    });

    const lenders = data || [];
    const filtered = lenders.filter(
        (l) =>
            !search ||
            l.businessName?.toLowerCase().includes(search.toLowerCase()) ||
            l.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
            l.address?.city?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Find a Lender</h1>
                <p className="text-slate-400 text-sm mt-1">
                    Browse verified lenders and submit a loan request directly.
                </p>
            </div>

            {/* Search */}
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">🔍</span>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, owner, or city…"
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-slate-800/40 rounded-2xl h-64 animate-pulse" />
                    ))}
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <span className="text-4xl">⚠️</span>
                    <p className="text-slate-400">Failed to load lenders.</p>
                    <button
                        onClick={refetch}
                        className="text-violet-400 hover:text-violet-300 text-sm underline"
                    >
                        Try again
                    </button>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <span className="text-4xl">🏦</span>
                    <p className="text-slate-400">No lenders found{search ? ' matching your search' : ''}.</p>
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
