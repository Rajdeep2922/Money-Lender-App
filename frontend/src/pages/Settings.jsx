import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
    Save,
    Bell,
    Shield,
    Download,
    Building,
    Globe,
    Upload,
    CheckCircle,
    Trash2,
    Scale,
    ScrollText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLender, useUpdateLender } from '../hooks/useLender';
import { PageLoader } from '../components/common/LoadingSpinner';
import LoanPolicySettings from './Settings/LoanPolicySettings';
import LegalCenter from './Settings/LegalCenter';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    const tabs = [
        { id: 'profile', label: 'Business Profile', icon: Building },
        { id: 'preferences', label: 'Preferences', icon: Globe },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'loan-policy', label: 'Loan Policy', icon: Scale },
        { id: 'legal', label: 'Legal Center', icon: ScrollText },
    ];

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6"
        >
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Manage your lending business configuration and preferences
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:w-64 flex-shrink-0">
                    <nav className="bg-white dark:bg-surface-elevated rounded-2xl border border-black/[0.06] dark:border-white/[0.08] p-2 lg:sticky lg:top-4 shadow-xs">
                        <div className="space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            group w-full flex items-center
                                            px-3.5 py-2.5
                                            text-xs font-medium rounded-xl 
                                            transition-all duration-150
                                            ${isActive
                                                ? 'bg-primary text-white shadow-xs font-semibold'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] hover:text-gray-900 dark:hover:text-white'
                                            }
                                        `}
                                    >
                                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mr-2.5">
                                            <Icon
                                                className={`
                                                    w-4 h-4 transition-transform duration-150
                                                    ${isActive
                                                        ? 'text-white'
                                                        : 'text-gray-400 group-hover:text-primary dark:group-hover:text-primary-bright'
                                                    }
                                                `}
                                            />
                                        </div>
                                        <span className="flex-1 text-left truncate">{tab.label}</span>
                                        {isActive && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-white ml-2 flex-shrink-0"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    <div className="bg-white dark:bg-surface-elevated rounded-2xl border border-black/[0.06] dark:border-white/[0.08] p-5 sm:p-7 shadow-xs">
                        {activeTab === 'profile' && <ProfileSettings />}
                        {activeTab === 'preferences' && <PreferenceSettings />}
                        {activeTab === 'notifications' && <NotificationSettings />}
                        {activeTab === 'security' && <SecuritySettings />}
                        {activeTab === 'loan-policy' && <LoanPolicySettings />}
                        {activeTab === 'legal' && <LegalCenter />}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const ProfileSettings = () => {
    const { data: lender, isLoading } = useLender();
    const updateLender = useUpdateLender();
    const [stampPreview, setStampPreview] = useState(null);

    const { register, handleSubmit, setValue, reset, getValues } = useForm();


    React.useEffect(() => {
        if (lender) {
            reset({
                businessName: lender.businessName,
                ownerName: lender.ownerName,
                email: lender.email,
                phone: lender.phone,
                'address.street': lender.address?.street,
                'address.city': lender.address?.city,
                'address.state': lender.address?.state,
                panNumber: lender.panNumber,
                companyStamp: lender.companyStamp,
                termsAndConditions: lender.termsAndConditions,
                'bankDetails.bankName': lender.bankDetails?.bankName,
                'bankDetails.accountNumber': lender.bankDetails?.accountNumber,
                'bankDetails.ifscCode': lender.bankDetails?.ifscCode,
                'bankDetails.accountName': lender.bankDetails?.accountName,
            });
            setStampPreview(lender.companyStamp);
        }
    }, [lender, reset]);

    if (isLoading) return <PageLoader />;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 100 * 1024) {
                toast.error('File size too large. Max 100KB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setStampPreview(base64String);
                setValue('companyStamp', base64String, { shouldDirty: true });
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data) => {
        const toastId = toast.loading('Saving settings...');
        try {
            // Ensure companyStamp is included
            const submitData = {
                ...data,
                companyStamp: stampPreview || data.companyStamp || ''
            };
            console.log('Submitting with companyStamp:', submitData.companyStamp ? 'present' : 'undefined');
            await updateLender.mutateAsync(submitData);
            toast.success('Settings saved successfully!', { id: toastId });
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings', { id: toastId });
        }
    };

    const inputStyle = "w-full px-3.5 py-2.5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl bg-white dark:bg-black/30 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
    const labelStyle = "text-xs font-medium text-gray-700 dark:text-gray-300";

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
                Business Information
            </h2>

            <div className="flex flex-col gap-4">
                {/* Business Name */}
                <div className="flex flex-col gap-1">
                    <label className={labelStyle}>Business Name</label>
                    <input
                        {...register('businessName')}
                        className={inputStyle}
                        placeholder="Enter business name"
                    />
                </div>

                {/* Owner Name */}
                <div className="flex flex-col gap-1">
                    <label className={labelStyle}>Owner Name</label>
                    <input
                        {...register('ownerName')}
                        className={inputStyle}
                        placeholder="Enter owner name"
                    />
                </div>

                {/* Tax ID */}
                <div className="flex flex-col gap-1">
                    <label className={labelStyle}>Tax ID / PAN Number</label>
                    <input
                        {...register('panNumber')}
                        className={inputStyle}
                        placeholder="Enter PAN number"
                    />
                </div>

                {/* Business Email */}
                <div className="flex flex-col gap-1">
                    <label className={labelStyle}>Business Email</label>
                    <input
                        {...register('email')}
                        type="email"
                        className={inputStyle}
                        placeholder="business@example.com"
                    />
                </div>

                {/* Phone Number */}
                <div className="flex flex-col gap-1">
                    <label className={labelStyle}>Phone Number</label>
                    <input
                        {...register('phone')}
                        type="tel"
                        className={inputStyle}
                        placeholder="Enter phone number"
                    />
                </div>

                {/* Street Address */}
                <div className="flex flex-col gap-1">
                    <label className={labelStyle}>Street Address</label>
                    <input
                        {...register('address.street')}
                        className={inputStyle}
                        placeholder="Enter street address"
                    />
                </div>

                {/* City */}
                <div className="flex flex-col gap-1">
                    <label className={labelStyle}>City</label>
                    <input
                        {...register('address.city')}
                        className={inputStyle}
                        placeholder="Enter city"
                    />
                </div>

                {/* State */}
                <div className="flex flex-col gap-1">
                    <label className={labelStyle}>State</label>
                    <input
                        {...register('address.state')}
                        className={inputStyle}
                        placeholder="Enter state"
                    />
                </div>
            </div>

            {/* Bank Details Section */}
            <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Bank Details (For EMI Payments)</h3>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className={labelStyle}>Bank Name</label>
                        <input
                            {...register('bankDetails.bankName')}
                            className={inputStyle}
                            placeholder="Enter bank name"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className={labelStyle}>Account Number</label>
                        <input
                            {...register('bankDetails.accountNumber')}
                            type="text"
                            className={inputStyle}
                            placeholder="Enter account number"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className={labelStyle}>IFSC Code</label>
                        <input
                            {...register('bankDetails.ifscCode')}
                            className={inputStyle}
                            placeholder="Enter IFSC code"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className={labelStyle}>Account Name</label>
                        <input
                            {...register('bankDetails.accountName')}
                            className={inputStyle}
                            placeholder="Enter account holder name"
                        />
                    </div>
                </div>
            </div>

            {/* Terms & Conditions Section */}
            <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Loan Agreement Terms &amp; Conditions</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Each line will be automatically numbered in the PDF agreement.</p>
                <textarea
                    {...register('termsAndConditions')}
                    rows="6"
                    className="w-full px-3.5 py-2.5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl bg-white dark:bg-black/30 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono transition-all"
                    placeholder="Enter terms here, one per line..."
                />
            </div>

            {/* Company Stamp/Signature */}
            <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-2">Company Stamp / Lender Signature</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-28 h-28 border border-dashed border-black/[0.15] dark:border-white/[0.2] rounded-xl flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-black/40">
                        {stampPreview ? (
                            <img src={stampPreview} alt="Company Stamp" className="max-w-full max-h-full object-contain" />
                        ) : (
                            <Building className="w-6 h-6 text-gray-400" />
                        )}
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-white/[0.06] text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/[0.1] cursor-pointer transition-colors shadow-2xs">
                            <Upload className="w-3.5 h-3.5" />
                            {stampPreview ? 'Change Stamp' : 'Upload Stamp'}
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500">
                            Recommended: PNG with transparent background. Max 100KB.
                        </p>
                        {stampPreview && (
                            <button
                                type="button"
                                onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setStampPreview(null);
                                    setValue('companyStamp', '', { shouldDirty: true });
                                    const toastId = toast.loading('Removing stamp...');
                                    try {
                                        const currentData = getValues();
                                        await updateLender.mutateAsync({
                                            ...currentData,
                                            companyStamp: ''
                                        });
                                        toast.success('Stamp removed successfully!', { id: toastId });
                                    } catch (error) {
                                        toast.error('Failed to remove stamp', { id: toastId });
                                    }
                                }}
                                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 hover:underline"
                            >
                                <Trash2 className="w-3 h-3" /> Remove Stamp
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={updateLender.isPending}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold text-xs rounded-xl shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Save className="w-3.5 h-3.5" />
                    {updateLender.isPending ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

const PreferenceSettings = () => {
    const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'INR');
    const [dateFormat, setDateFormat] = useState(() => localStorage.getItem('dateFormat') || 'DD/MM/YYYY');

    const handleCurrencyChange = (e) => {
        const value = e.target.value;
        setCurrency(value);
        localStorage.setItem('currency', value);
        toast.success(`Currency set to ${value}`);
    };

    const handleDateFormatChange = (e) => {
        const value = e.target.value;
        setDateFormat(value);
        localStorage.setItem('dateFormat', value);
        toast.success(`Date format set to ${value}`);
    };

    const handleExportData = async () => {
        const toastId = toast.loading('Exporting data...');
        try {
            // Simulate export - in real app, call an API
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Data exported successfully! Check your downloads.', { id: toastId });
        } catch (error) {
            toast.error('Export failed', { id: toastId });
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                System Preferences
            </h2>

            <div className="space-y-4">
                {/* Currency Selection */}
                <div className="flex items-center justify-between py-3">
                    <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Default Currency</h3>
                        <p className="text-sm text-gray-500">Currency symbol to display across the app</p>
                    </div>
                    <select
                        className="input w-32"
                        value={currency}
                        onChange={handleCurrencyChange}
                    >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                    </select>
                </div>

                {/* Date Format Selection */}
                <div className="flex items-center justify-between py-3">
                    <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Date Format</h3>
                        <p className="text-sm text-gray-500">How dates should be displayed</p>
                    </div>
                    <select
                        className="input w-40"
                        value={dateFormat}
                        onChange={handleDateFormatChange}
                    >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                </div>

                {/* Data Export */}
                <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                    <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Data Export</h3>
                        <p className="text-sm text-gray-500">Download all your data as JSON</p>
                    </div>
                    <button type="button" className="btn btn-secondary gap-2" onClick={handleExportData}>
                        <Download className="w-4 h-4" />
                        Export Data
                    </button>
                </div>
            </div>
        </div>
    );
};

const NotificationSettings = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-black/[0.06] dark:border-white/[0.08] pb-3 mb-4">
                Notification Preferences
            </h2>

            <div className="space-y-4">
                {[
                    { id: 'payment_received', title: 'Payment Received', desc: 'Get notified when a payment is recorded' },
                    { id: 'loan_approved', title: 'Loan Approved', desc: 'Get notified when a loan is approved' },
                    { id: 'daily_summary', title: 'Daily Summary', desc: 'Receive a daily summary of business activity' },
                    { id: 'missed_payment', title: 'Missed Payments', desc: 'Alert when a payment is overdue' },
                ].map((item) => (
                    <div key={item.id} className="flex items-start justify-between py-3">
                        <div>
                            <h3 className="text-xs font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                        </div>
                        <div className="relative inline-block w-11 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer bg-gray-200 dark:bg-white/[0.1]">
                            <input
                                type="checkbox"
                                id={item.id}
                                className="peer absolute w-full h-full opacity-0 cursor-pointer"
                                defaultChecked
                            />
                            <div className="block w-11 h-6 bg-gray-200 dark:bg-white/[0.1] rounded-full peer-checked:bg-primary transition-colors"></div>
                            <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5 shadow-xs"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SecuritySettings = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-black/[0.06] dark:border-white/[0.08] pb-3 mb-4">
                Security
            </h2>

            <form className="space-y-4">
                <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Current Password</label>
                    <input type="password" className="w-full px-3.5 py-2.5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl bg-white dark:bg-black/30 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">New Password</label>
                    <input type="password" className="w-full px-3.5 py-2.5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl bg-white dark:bg-black/30 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Confirm New Password</label>
                    <input type="password" className="w-full px-3.5 py-2.5 border border-black/[0.08] dark:border-white/[0.1] rounded-xl bg-white dark:bg-black/30 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div className="pt-2">
                    <button type="button" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold text-xs rounded-xl shadow-sm active:scale-[0.98] transition-all" onClick={() => toast.success('Password update simulation')}>
                        Update Password
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;
