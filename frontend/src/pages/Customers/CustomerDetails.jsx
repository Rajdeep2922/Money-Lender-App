import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiPhone, FiMail, FiMapPin, FiCreditCard, FiArrowLeft, FiEdit, FiShield, FiRefreshCw, FiLock, FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';
import { useCustomer, useUpdateCustomer } from '../../hooks/useCustomers';
import { useLoans } from '../../hooks/useLoans';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const CustomerDetails = () => {
    const { id } = useParams();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const { data: customer, isLoading: loadingCustomer, refetch: refetchCustomer } = useCustomer(id);
    const { data: loansData, isLoading: loadingLoans, refetch: refetchLoans } = useLoans({ customerId: id });
    const updateCustomer = useUpdateCustomer();

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([refetchCustomer(), refetchLoans()]);
        setTimeout(() => setIsRefreshing(false), 500);
    };

    const handlePasswordUpdate = async () => {
        if (!newPassword || newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        try {
            await updateCustomer.mutateAsync({
                id,
                data: {
                    enablePortal: true,
                    portalPassword: newPassword
                }
            });
            toast.success('Password updated successfully');
            setNewPassword('');
            setIsEditingPassword(false);
            refetchCustomer();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        }
    };

    const handleTogglePortalAccess = async (enable) => {
        try {
            await updateCustomer.mutateAsync({
                id,
                data: { enablePortal: enable }
            });
            toast.success(enable ? 'Portal access enabled' : 'Portal access disabled');
            refetchCustomer();
        } catch (error) {
            toast.error('Failed to update portal access');
        }
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

                        {/* Portal Access Section */}
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    <FiLock className="text-blue-600" />
                                    Portal Access
                                </p>
                                <span className={`badge ${customer.isPortalActive ? 'badge-success' : 'badge-error'}`}>
                                    {customer.isPortalActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            {customer.isPortalActive ? (
                                <div className="space-y-3">
                                    {/* Password Display */}
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-gray-500">Login Email</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.email}</p>
                                    </div>

                                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-gray-500">Password</span>
                                            <button
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                            >
                                                {showPassword ? <FiEyeOff className="w-3 h-3" /> : <FiEye className="w-3 h-3" />}
                                                {showPassword ? 'Hide' : 'Show'}
                                            </button>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                                            {showPassword ? '••••••••' : '••••••••'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1 italic">Passwords are encrypted and cannot be viewed</p>
                                    </div>

                                    {/* Password Update */}
                                    {isEditingPassword ? (
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <label className="text-xs text-gray-600 dark:text-gray-400 block mb-2">New Password</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="Enter new password"
                                                    className="input flex-1 text-sm"
                                                    minLength={6}
                                                />
                                                <button
                                                    onClick={handlePasswordUpdate}
                                                    disabled={updateCustomer.isPending}
                                                    className="btn btn-primary btn-sm"
                                                    title="Save"
                                                >
                                                    <FiCheck className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => { setIsEditingPassword(false); setNewPassword(''); }}
                                                    className="btn btn-secondary btn-sm"
                                                    title="Cancel"
                                                >
                                                    <FiX className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">Minimum 6 characters</p>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditingPassword(true)}
                                            className="btn btn-secondary btn-sm w-full"
                                        >
                                            <FiLock className="w-4 h-4 mr-2" />
                                            Update Password
                                        </button>
                                    )}

                                    {/* Last Login */}
                                    {customer.lastPortalLogin && (
                                        <p className="text-xs text-gray-500">
                                            Last login: {formatDate(customer.lastPortalLogin)}
                                        </p>
                                    )}

                                    {/* Disable Portal */}
                                    <button
                                        onClick={() => handleTogglePortalAccess(false)}
                                        className="text-xs text-red-600 hover:text-red-700"
                                    >
                                        Disable Portal Access
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-sm text-gray-500 mb-3">
                                        Portal access is not enabled for this customer.
                                    </p>
                                    <Link
                                        to={`/customers/${id}/edit`}
                                        className="btn btn-primary btn-sm"
                                    >
                                        Enable Portal Access
                                    </Link>
                                </div>
                            )}
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
