import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { useLoans } from '../../hooks/useLoans';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate, formatStatus, getStatusColor } from '../../utils/formatters';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
};

export const LoanList = () => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('');

    const { data, isLoading, error } = useLoans({ page, limit: 20, status: status || undefined, search });

    if (isLoading && !data) return <PageLoader />;
    if (error) return <div className="text-red-500">Error: {error.message}</div>;

    const { loans = [], pagination = {} } = data || {};

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loans</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage your loan portfolio
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link to="/loans/new" className="btn btn-primary">
                        <FiPlus className="w-4 h-4 mr-2" />
                        Create Loan
                    </Link>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by loan number or customer name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input pl-10"
                    />
                </div>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="input sm:w-48"
                >
                    <option value="">All Status</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="defaulted">Defaulted</option>
                </select>
            </motion.div>

            {/* Loan Table */}
            <motion.div variants={itemVariants} className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Loan #</th>
                            <th>Customer</th>
                            <th>Principal</th>
                            <th>EMI</th>
                            <th>Rate</th>
                            <th>Balance</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {loans.map((loan) => (
                            <tr key={loan._id}>
                                <td>
                                    <Link to={`/loans/${loan._id}`} className="text-teal-600 hover:text-teal-700 font-medium">
                                        {loan.loanNumber}
                                    </Link>
                                </td>
                                <td>
                                    {loan.customerId?.firstName} {loan.customerId?.lastName}
                                </td>
                                <td className="font-medium">{formatCurrency(loan.principal)}</td>
                                <td>{formatCurrency(loan.monthlyEMI)}</td>
                                <td>{loan.monthlyInterestRate}%</td>
                                <td className="font-medium">{formatCurrency(loan.remainingBalance)}</td>
                                <td>
                                    <span className={`badge ${getStatusColor(loan.status)}`}>
                                        {formatStatus(loan.status)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {loans.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-gray-500">
                                    No loans found. <Link to="/loans/new" className="text-teal-600">Create your first loan</Link>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </motion.div>

            {/* Pagination */}
            {
                pagination.pages > 1 && (
                    <motion.div variants={itemVariants} className="flex justify-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="btn btn-secondary btn-sm"
                        >
                            Previous
                        </button>
                        <span className="flex items-center px-4 text-gray-600 dark:text-gray-400">
                            Page {page} of {pagination.pages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                            disabled={page === pagination.pages}
                            className="btn btn-secondary btn-sm"
                        >
                            Next
                        </button>
                    </motion.div>
                )
            }
        </motion.div >
    );
};

export default LoanList;
