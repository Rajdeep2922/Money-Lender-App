import React from 'react';
import { FiFileText, FiEdit3, FiX, FiLock, FiDownload, FiCheck } from 'react-icons/fi';

const AgreementModeModal = ({
    isOpen,
    onClose,
    onSelectStandard,
    onSelectCustomized,
    hasExistingAgreement = false,
    isStandardLoading = false,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-xl w-full shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-xl">
                            <FiFileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Select Agreement Format
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Choose how you want to generate the loan agreement
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {hasExistingAgreement && (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 text-xs">
                            <FiLock className="w-4 h-4 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-semibold">Agreement Already Generated (Immutable)</p>
                                <p className="mt-0.5">
                                    An official agreement has already been created for this loan. Agreements are write-once legal records and cannot be replaced or customized.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Standard Option */}
                        <div className="relative flex flex-col justify-between p-5 rounded-xl border-2 border-teal-500 bg-teal-50/20 dark:bg-teal-950/20 hover:border-teal-600 transition-all">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="p-2 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 rounded-lg">
                                        <FiFileText className="w-5 h-5" />
                                    </span>
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/40 px-2 py-0.5 rounded-full">
                                        Standard
                                    </span>
                                </div>
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                                    Standard Agreement
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                                    Generated automatically using standard institutional policies, loan calculations, and legal center clauses.
                                </p>
                            </div>
                            <button
                                onClick={onSelectStandard}
                                disabled={isStandardLoading}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm shadow-teal-500/20 transition-colors disabled:opacity-50"
                            >
                                <FiDownload className="w-3.5 h-3.5" />
                                {isStandardLoading ? 'Downloading...' : hasExistingAgreement ? 'Download Agreement' : 'Generate Standard'}
                            </button>
                        </div>

                        {/* Customized Option */}
                        <div className={`relative flex flex-col justify-between p-5 rounded-xl border ${
                            hasExistingAgreement
                                ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 opacity-60 cursor-not-allowed'
                                : 'border-gray-200 dark:border-gray-700 hover:border-teal-400 dark:hover:border-teal-600 bg-white dark:bg-gray-800 transition-all'
                        }`}>
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">
                                        <FiEdit3 className="w-5 h-5" />
                                    </span>
                                    {hasExistingAgreement ? (
                                        <span className="flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                            <FiLock className="w-3 h-3" /> Locked
                                        </span>
                                    ) : (
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded-full">
                                            Custom
                                        </span>
                                    )}
                                </div>
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                                    Customized Agreement
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                                    Tailor repayment frequency, custom interest, specific dates, and add special lender-borrower agreed covenants.
                                </p>
                            </div>
                            <button
                                onClick={onSelectCustomized}
                                disabled={hasExistingAgreement}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FiEdit3 className="w-3.5 h-3.5" />
                                Customize Terms
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 px-6 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                    <span>Agreements are immutable once generated.</span>
                    <button
                        onClick={onClose}
                        className="font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AgreementModeModal;
