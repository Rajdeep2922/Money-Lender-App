import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiPhone, FiMail, FiMapPin, FiCreditCard, FiArrowLeft, FiEdit, FiShield, FiRefreshCw } from 'react-icons/fi';
import { useCustomer } from '../../hooks/useCustomers';
import { useLoans } from '../../hooks/useLoans';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';

const CustomerDetails = () => {
    const { id } = useParams();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { data: customer, isLoading: loadingCustomer, refetch: refetchCustomer } = useCustomer(id);
    const { data: loansData, isLoading: loadingLoans, refetch: refetchLoans } = useLoans({ customerId: id });

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([refetchCustomer(), refetchLoans()]);
        setTimeout(() => setIsRefreshing(false), 500);
    };

    if (loadingCustomer || loadingLoans) {
        return <PageLoader />;
    }

    if (!customer) {
        return (
            <div className="text-center p-8">
                <p className="text-gray-500">Customer not found</p>
                <Link to="/customers" className="text-teal-600 hover:text-teal-700 mt-2 inline-block">
                    Back to Customers
                </Link>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/customers" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <FiArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {customer.firstName} {customer.lastName}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Customer ID: {customer._id}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 items-center w-full sm:w-auto">
                    <button
                        onClick={handleRefresh}
                        className="btn btn-secondary"
                        disabled={isRefreshing}
                        title="Refresh Details"
                    >
                        <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <Link to={`/customers/${id}/edit`} className="btn btn-secondary gap-2 flex-1 sm:flex-initial justify-center">
                        <FiEdit className="w-4 h-4" />
                        Edit Profile
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="card p-4 sm:p-6 lg:col-span-1 space-y-6">
                    <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-700">
                        <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400 overflow-hidden">
                            {customer.photo ? (
                                <img src={customer.photo} alt={customer.firstName} className="w-full h-full object-cover" />
                            ) : (
                                <FiUser className="w-8 h-8" />
                            )}
                        </div>
                        <div>
                            <span className={`badge ${customer.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                                {customer.status}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                            <FiMail className="w-5 h-5 mt-0.5 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium">Email</p>
                                <p className="text-sm">{customer.email}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                            <FiPhone className="w-5 h-5 mt-0.5 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium">Phone</p>
                                <p className="text-sm">{customer.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                            <FiMapPin className="w-5 h-5 mt-0.5 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium">Address</p>
                                <p className="text-sm">
                                    {customer.address?.city}, {customer.address?.state}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                            <FiShield className="w-5 h-5 mt-0.5 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium">Aadhaar Card</p>
                                <p className="text-sm">{customer.aadhaarNumber || '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                            <FiCreditCard className="w-5 h-5 mt-0.5 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium">PAN Number</p>
                                <p className="text-sm">{customer.panNumber || '-'}</p>
                            </div>
                        </div>

                        {/* Signature Preview */}
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Customer Signature</p>
                            <div className="w-full aspect-[3/1] bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                                {customer.signature ? (
                                    customer.signature.startsWith('data:application/pdf') ? (
                                        <div className="text-center p-2">
                                            <FiShield className="w-8 h-8 text-teal-600 mx-auto mb-1" />
                                            <p className="text-xs text-gray-500">PDF Signature Attached</p>
                                        </div>
                                    ) : (
                                        <img src={customer.signature} alt="Customer Signature" className="max-w-full max-h-full object-contain" />
                                    )
                                ) : (
                                    <p className="text-xs text-gray-400italic">No signature uploaded</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loans & Activity */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Loans Card */}
                    <div className="card p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Active Loans
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Loan Number</th>
                                        <th>Amount</th>
                                        <th>Balance</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loansData?.loans?.map((loan) => (
                                        <tr key={loan._id}>
                                            <td className="font-medium">{loan.loanNumber}</td>
                                            <td>{formatCurrency(loan.principal)}</td>
                                            <td>{formatCurrency(loan.remainingBalance)}</td>
                                            <td>
                                                <span className={`badge ${loan.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                                    {loan.status}
                                                </span>
                                            </td>
                                            <td>
                                                <Link to={`/loans/${loan._id}`} className="text-teal-600 hover:text-teal-700 font-medium text-sm">
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!loansData?.loans || loansData.loans.length === 0) && (
                                        <tr>
                                            <td colSpan="5" className="text-center py-8 text-gray-500">
                                                No loans found for this customer.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CustomerDetails;
