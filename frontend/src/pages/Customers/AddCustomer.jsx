import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiArrowLeft, FiSave, FiTrash2, FiUpload, FiFileText, FiImage } from 'react-icons/fi';
import { useCreateCustomer, useUpdateCustomer, useCustomer } from '../../hooks/useCustomers';
import { PageLoader } from '../../components/common/LoadingSpinner';

const customerSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone must be at least 10 digits'),
    address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
    }).optional(),
    aadhaarNumber: z.string().min(12, 'Aadhaar must be 12 digits').max(12, 'Aadhaar must be 12 digits').optional().or(z.literal('')),
    panNumber: z.string().optional(),
    notes: z.string().optional(),
    signature: z.string().optional(),
    photo: z.string().optional(),
});

export const AddCustomer = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();

    // Hooks
    const createCustomer = useCreateCustomer();
    const updateCustomer = useUpdateCustomer();
    const { data: customer, isLoading: loadingCustomer } = useCustomer(id);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            address: { country: 'India' },
            signature: '',
            photo: '',
        },
    });

    const signatureValue = watch('signature');
    const photoValue = watch('photo');

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            // Check size (max 100KB)
            if (file.size > 100 * 1024) {
                alert('File is too large. Max 100KB allowed.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setValue(field, reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const isPDF = signatureValue?.startsWith('data:application/pdf');
    const isImage = signatureValue?.startsWith('data:image');

    // Load data for edit mode
    useEffect(() => {
        if (isEditMode && customer) {
            reset({
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone,
                address: {
                    street: customer.address?.street || '',
                    city: customer.address?.city || '',
                    state: customer.address?.state || '',
                },
                aadhaarNumber: customer.aadhaarNumber || '',
                panNumber: customer.panNumber || '',
                notes: customer.notes || '',
                signature: customer.signature || '',
                photo: customer.photo || '',
            });
        }
    }, [isEditMode, customer, reset]);

    const onSubmit = async (data) => {
        try {
            if (isEditMode) {
                await updateCustomer.mutateAsync({ id, data });
            } else {
                await createCustomer.mutateAsync(data);
            }
            navigate(isEditMode ? `/customers/${id}` : '/customers');
        } catch (error) {
            console.error('Error saving customer:', error);
            alert(`Error: ${error.response?.data?.message || error.message}`);
        }
    };

    if (isEditMode && loadingCustomer) {
        return <PageLoader />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
        >
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isEditMode ? 'Edit Customer' : 'Add Customer'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {isEditMode ? 'Update customer details' : 'Create a new borrower profile'}
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-6">
                {/* Basic Info */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Basic Information
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="label">First Name *</label>
                            <input {...register('firstName')} className={`input ${errors.firstName ? 'input-error' : ''}`} />
                            {errors.firstName && <p className="error-text">{errors.firstName.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="label">Last Name *</label>
                            <input {...register('lastName')} className={`input ${errors.lastName ? 'input-error' : ''}`} />
                            {errors.lastName && <p className="error-text">{errors.lastName.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="label">Email *</label>
                            <input type="email" {...register('email')} className={`input ${errors.email ? 'input-error' : ''}`} />
                            {errors.email && <p className="error-text">{errors.email.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="label">Phone *</label>
                            <input {...register('phone')} placeholder="+91-9999999999" className={`input ${errors.phone ? 'input-error' : ''}`} />
                            {errors.phone && <p className="error-text">{errors.phone.message}</p>}
                        </div>
                    </div>
                </div>

                {/* Address & IDs */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Address & Verification
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="form-group sm:col-span-2">
                            <label className="label">Street</label>
                            <input {...register('address.street')} className="input" />
                        </div>
                        <div className="form-group">
                            <label className="label">City</label>
                            <input {...register('address.city')} className="input" />
                        </div>
                        <div className="form-group">
                            <label className="label">State</label>
                            <input {...register('address.state')} className="input" />
                        </div>
                        <div className="form-group">
                            <label className="label">Aadhaar Card Number</label>
                            <input {...register('aadhaarNumber')} className={`input ${errors.aadhaarNumber ? 'input-error' : ''}`} placeholder="1234 5678 9012" />
                            {errors.aadhaarNumber && <p className="error-text">{errors.aadhaarNumber.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="label">PAN Number</label>
                            <input {...register('panNumber')} className="input" placeholder="ABCDE1234F" />
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="form-group">
                    <label className="label">Notes</label>
                    <textarea {...register('notes')} rows={3} className="input" />
                </div>

                {/* Passport Photo Section */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Passport Size Photo
                    </h2>
                    <div className="space-y-4">
                        <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'photo')}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                title="Upload Passport Photo"
                            />
                            <div className="flex flex-col items-center justify-center text-center">
                                <FiImage className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Click to upload photo
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Supports PNG, JPG (Max 100KB)
                                </p>
                            </div>
                        </div>

                        {photoValue && (
                            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800">
                                <div className="flex items-center gap-3">
                                    <img src={photoValue} alt="Passport Photo" className="h-16 w-16 object-cover bg-white rounded-full border border-gray-200" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            Passport Photo
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Successfully uploaded
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setValue('photo', '')}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                >
                                    <FiTrash2 className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Signature Section */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Upload Signature Record
                    </h2>
                    <div className="space-y-4">
                        <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => handleFileChange(e, 'signature')}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                title="Upload signature (PDF or Image)"
                            />
                            <div className="flex flex-col items-center justify-center text-center">
                                <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Click to upload signature
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Supports PDF, PNG, JPG (Max 100KB)
                                </p>
                            </div>
                        </div>

                        {signatureValue && (
                            <div className="flex items-center justify-between p-4 bg-teal-50 dark:bg-teal-900/10 rounded-xl border border-teal-100 dark:border-teal-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                        {isImage ? (
                                            <FiImage className="w-5 h-5 text-teal-600" />
                                        ) : (
                                            <FiFileText className="w-5 h-5 text-red-500" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {isImage ? 'Signature Image' : 'Signature PDF'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Successfully uploaded
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {isImage && (
                                        <img src={signatureValue} alt="Preview" className="h-10 w-20 object-contain bg-white rounded border border-gray-200" />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setValue('signature', '')}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                    >
                                        <FiTrash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {!signatureValue && (
                            <p className="text-xs text-gray-500 italic">
                                Note: For the signature to appear directly on the PDF agreement, please upload a PNG/JPG file. Uploading a PDF will store it as a record but it won't be embedded as a stamp.
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                        <FiSave className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Customer' : 'Save Customer')}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default AddCustomer;
