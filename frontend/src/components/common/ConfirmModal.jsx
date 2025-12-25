import { Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiAlertTriangle, FiHelpCircle, FiTrash2, FiCheck } from 'react-icons/fi';

const iconMap = {
    warning: { icon: FiAlertTriangle, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    danger: { icon: FiTrash2, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
    question: { icon: FiHelpCircle, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    success: { icon: FiCheck, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
};

const buttonStyles = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white',
    primary: 'bg-teal-600 hover:bg-teal-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
};

/**
 * Beautiful Custom Confirmation Modal
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {function} props.onClose - Close handler
 * @param {function} props.onConfirm - Confirm handler
 * @param {string} props.title - Modal title
 * @param {string} props.message - Modal message/description
 * @param {string} props.confirmText - Text for confirm button
 * @param {string} props.cancelText - Text for cancel button
 * @param {string} props.type - 'warning' | 'danger' | 'question' | 'success'
 * @param {string} props.confirmStyle - 'danger' | 'warning' | 'primary' | 'success'
 * @param {boolean} props.loading - Show loading state on confirm button
 */
export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'question',
    confirmStyle = 'primary',
    loading = false,
}) => {
    const iconConfig = iconMap[type] || iconMap.question;
    const IconComponent = iconConfig.icon;

    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <Fragment>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden mx-4">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <FiX className="w-5 h-5" />
                            </button>

                            {/* Content */}
                            <div className="p-6 pt-8 text-center">
                                {/* Icon */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.1, damping: 15 }}
                                    className={`w-16 h-16 mx-auto mb-4 rounded-full ${iconConfig.bg} flex items-center justify-center`}
                                >
                                    <IconComponent className={`w-8 h-8 ${iconConfig.color}`} />
                                </motion.div>

                                {/* Title */}
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {title}
                                </h3>

                                {/* Message */}
                                <p className="text-gray-500 dark:text-gray-400 mb-6">
                                    {message}
                                </p>

                                {/* Buttons */}
                                <div className="flex gap-3 justify-center">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={onClose}
                                        disabled={loading}
                                        className="px-6 py-2.5 rounded-xl font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        {cancelText}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleConfirm}
                                        disabled={loading}
                                        className={`px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 ${buttonStyles[confirmStyle] || buttonStyles.primary} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {loading && (
                                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                        )}
                                        {confirmText}
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </Fragment>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
