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
    Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLender, useUpdateLender } from '../hooks/useLender';
import { PageLoader } from '../components/common/LoadingSpinner';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [isDark, setIsDark] = useState(false); // Mock state for now

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    const tabs = [
        { id: 'profile', label: 'Business Profile', icon: Building },
        { id: 'preferences', label: 'Preferences', icon: Globe },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-4xl mx-auto space-y-6"
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
                    <nav className="space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                                        ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <div className="bg-white dark:bg-gray-800 shadow rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                        {activeTab === 'profile' && <ProfileSettings />}
                        {activeTab === 'preferences' && <PreferenceSettings isDark={isDark} setIsDark={setIsDark} />}
                        {activeTab === 'notifications' && <NotificationSettings />}
                        {activeTab === 'security' && <SecuritySettings />}
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

    return (

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                Business Information
            </h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="col-span-2">
                    <label className="label">Business Name</label>
                    <input {...register('businessName')} className="input" />
                </div>

                <div>
                    <label className="label">Owner Name</label>
                    <input {...register('ownerName')} className="input" />
                </div>

                <div>
                    <label className="label">Tax ID / PAN Number</label>
                    <input {...register('panNumber')} className="input" />
                </div>

                <div>
                    <label className="label">Business Email</label>
                    <input {...register('email')} type="email" className="input" />
                </div>

                <div>
                    <label className="label">Phone Number</label>
                    <input {...register('phone')} className="input" />
                </div>

                <div className="col-span-2">
                    <label className="label">Street Address</label>
                    <input {...register('address.street')} className="input" />
                </div>

                <div>
                    <label className="label">City</label>
                    <input {...register('address.city')} className="input" />
                </div>

                <div>
                    <label className="label">State</label>
                    <input {...register('address.state')} className="input" />
                </div>

                {/* Bank Details Section */}
                <div className="col-span-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">Bank Details (For EMI Payments)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Bank Name</label>
                            <input {...register('bankDetails.bankName')} className="input" />
                        </div>
                        <div>
                            <label className="label">Account Number</label>
                            <input {...register('bankDetails.accountNumber')} className="input" />
                        </div>
                        <div>
                            <label className="label">IFSC Code</label>
                            <input {...register('bankDetails.ifscCode')} className="input" />
                        </div>
                        <div>
                            <label className="label">Account Name</label>
                            <input {...register('bankDetails.accountName')} className="input" />
                        </div>
                    </div>
                </div>

                {/* Terms & Conditions Section */}
                <div className="col-span-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Loan Agreement Terms & Conditions</h3>
                    <p className="text-xs text-gray-500 mb-2">Each line will be automatically numbered in the PDF agreement.</p>
                    <textarea
                        {...register('termsAndConditions')}
                        rows="6"
                        className="input font-mono text-sm"
                        placeholder="Enter terms here, one per line..."
                    />
                </div>

                {/* Company Stamp/Signature */}
                <div className="col-span-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <label className="label">Company Stamp / Lender Signature</label>
                    <div className="mt-2 flex items-center gap-6">
                        <div className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900/50">
                            {stampPreview ? (
                                <img src={stampPreview} alt="Company Stamp" className="max-w-full max-h-full object-contain" />
                            ) : (
                                <Building className="w-8 h-8 text-gray-400" />
                            )}
                        </div>
                        <div className="flex-1 space-y-2">
                            <label className="btn btn-secondary btn-sm gap-2 cursor-pointer w-fit">
                                <Upload className="w-4 h-4" />
                                {stampPreview ? 'Change Stamp' : 'Upload Stamp'}
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                            <p className="text-xs text-gray-500">
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
                                        // Auto-save the removal with all current form data
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
            </div>

            <div className="flex justify-end pt-4">
                <button type="submit" disabled={updateLender.isPending} className="btn btn-primary gap-2">
                    <Save className="w-4 h-4" />
                    {updateLender.isPending ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

const PreferenceSettings = ({ isDark, setIsDark }) => {
    const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'INR');
    const [dateFormat, setDateFormat] = useState(() => localStorage.getItem('dateFormat') || 'DD/MM/YYYY');
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        if (saved !== null) return saved === 'true';
        return document.documentElement.classList.contains('dark');
    });

    const toggleDarkMode = (enabled) => {
        setDarkMode(enabled);
        localStorage.setItem('darkMode', enabled);
        if (enabled) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        toast.success(enabled ? 'Dark mode enabled' : 'Light mode enabled');
    };

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
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between py-3">
                    <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                        <p className="text-sm text-gray-500">Toggle between light and dark theme</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                        <input
                            type="checkbox"
                            id="darkModeToggle"
                            checked={darkMode}
                            onChange={(e) => toggleDarkMode(e.target.checked)}
                            className="peer absolute w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="block w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer-checked:bg-teal-600 transition-colors"></div>
                        <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-6"></div>
                    </div>
                </div>

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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
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
                            <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer bg-gray-200 dark:bg-gray-700">
                            <input
                                type="checkbox"
                                id={item.id}
                                className="peer absolute w-full h-full opacity-0 cursor-pointer"
                                defaultChecked
                            />
                            <div className="block w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer-checked:bg-teal-600 transition-colors"></div>
                            <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-6"></div>
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                Security
            </h2>

            <form className="space-y-4">
                <div>
                    <label className="label">Current Password</label>
                    <input type="password" className="input" />
                </div>
                <div>
                    <label className="label">New Password</label>
                    <input type="password" className="input" />
                </div>
                <div>
                    <label className="label">Confirm New Password</label>
                    <input type="password" className="input" />
                </div>
                <div className="pt-2">
                    <button type="button" className="btn btn-secondary" onClick={() => toast.success('Password update simulation')}>
                        Update Password
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;
