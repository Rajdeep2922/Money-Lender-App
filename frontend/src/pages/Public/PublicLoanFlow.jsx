import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, Star, MapPin, Loader2, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PURPOSES = ['Personal', 'Business', 'Education', 'Medical', 'Home Renovation', 'Vehicle', 'Debt Consolidation', 'Other'];

const STEPS = ['Browse Lenders', 'Fill Request', 'Confirmation'];

/**
 * PublicLoanFlow — fully public, no login required
 * Step 1: Browse + select lender
 * Step 2: Fill loan request form
 * Step 3: Success screen with tracking info
 */
const PublicLoanFlow = ({ onClose }) => {
    const [step, setStep] = useState(0);
    const [selectedLender, setSelectedLender] = useState(null);
    const [search, setSearch] = useState('');
    const [result, setResult] = useState(null);

    const [form, setForm] = useState({
        guestName: '', guestPhone: '', guestEmail: '',
        amount: '', purpose: '', message: '',
    });
    const [errors, setErrors] = useState({});

    // Fetch all lenders
    const { data, isLoading } = useQuery({
        queryKey: ['public-lenders'],
        queryFn: () => api.get('/lenders').then(r => r.data.data),
        staleTime: 5 * 60_000,
    });

    const lenders = data || [];
    const filtered = lenders.filter(l =>
        !search ||
        l.businessName?.toLowerCase().includes(search.toLowerCase()) ||
        l.address?.city?.toLowerCase().includes(search.toLowerCase())
    );

    // Submit mutation
    const mutation = useMutation({
        mutationFn: (payload) => api.post('/public/loan-request', payload),
        onSuccess: (res) => {
            setResult(res.data.data);
            setStep(2);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to submit request');
        },
    });

    const validate = () => {
        const e = {};
        if (!form.guestName.trim()) e.guestName = 'Name is required';
        if (!form.guestPhone.trim()) e.guestPhone = 'Phone is required';
        else if (!/^\d{10}$/.test(form.guestPhone.trim())) e.guestPhone = 'Enter a valid 10-digit phone number';
        if (!form.amount || Number(form.amount) < 1) e.amount = 'Enter a valid amount';
        if (!form.purpose) e.purpose = 'Select a purpose';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        mutation.mutate({
            lenderId: selectedLender._id,
            guestName: form.guestName.trim(),
            guestPhone: form.guestPhone.trim(),
            guestEmail: form.guestEmail.trim() || undefined,
            amount: Number(form.amount),
            purpose: form.purpose,
            message: form.message.trim() || undefined,
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {step === 1 && (
                            <button onClick={() => setStep(0)} className="w-8 h-8 rounded-lg bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        )}
                        <div>
                            <h2 className="text-white font-bold text-base">{STEPS[step]}</h2>
                            {step < 2 && <p className="text-gray-500 text-xs">Step {step + 1} of 2</p>}
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Progress bar */}
                {step < 2 && (
                    <div className="h-1 bg-gray-800 flex-shrink-0">
                        <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500" style={{ width: `${(step + 1) / 2 * 100}%` }} />
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {/* ── Step 0: Browse Lenders ── */}
                        {step === 0 && (
                            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-4">
                                <p className="text-gray-400 text-sm">Select the lender you want to request a loan from.</p>

                                {/* Search */}
                                <input
                                    type="text" value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="Search by name or city…"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
                                />

                                {/* Lender list */}
                                {isLoading ? (
                                    <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-teal-400 animate-spin" /></div>
                                ) : filtered.length === 0 ? (
                                    <p className="text-center text-gray-500 py-10">No lenders found.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {filtered.map(lender => (
                                            <button
                                                key={lender._id}
                                                onClick={() => { setSelectedLender(lender); setStep(1); }}
                                                className="w-full text-left p-4 rounded-xl bg-gray-800 border border-gray-700 hover:border-teal-500 hover:bg-gray-800/80 transition-all group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                                                        {lender.businessName?.charAt(0) || 'L'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white font-semibold truncate group-hover:text-teal-300 transition-colors">{lender.businessName}</p>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-emerald-400 text-xs font-medium">💰 {lender.interestRate ?? 12}% p.a.</span>
                                                            <span className="text-yellow-400 text-xs">⭐ {(lender.rating ?? 4.0).toFixed(1)}</span>
                                                            {lender.address?.city && <span className="text-gray-500 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" />{lender.address.city}</span>}
                                                        </div>
                                                        {lender.description && <p className="text-gray-400 text-xs mt-1 line-clamp-1">{lender.description}</p>}
                                                    </div>
                                                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-teal-400 transition-colors flex-shrink-0" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ── Step 1: Fill form ── */}
                        {step === 1 && selectedLender && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-4">
                                {/* Selected lender strip */}
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800 border border-gray-700">
                                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center text-white font-bold text-sm">
                                        {selectedLender.businessName?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-semibold">{selectedLender.businessName}</p>
                                        <p className="text-gray-400 text-xs">💰 {selectedLender.interestRate ?? 12}% p.a. · ⭐ {(selectedLender.rating ?? 4.0).toFixed(1)}</p>
                                    </div>
                                </div>

                                {/* Your details */}
                                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Your Details</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Full Name *</label>
                                        <input value={form.guestName} onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
                                            placeholder="Your full name" />
                                        {errors.guestName && <p className="text-red-400 text-xs mt-1">{errors.guestName}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Phone Number * <span className="text-teal-400">(used to track request)</span></label>
                                        <input value={form.guestPhone} onChange={e => setForm(f => ({ ...f, guestPhone: e.target.value }))}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
                                            placeholder="10-digit phone" maxLength={10} />
                                        {errors.guestPhone && <p className="text-red-400 text-xs mt-1">{errors.guestPhone}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Email <span className="text-gray-500">(optional)</span></label>
                                    <input value={form.guestEmail} onChange={e => setForm(f => ({ ...f, guestEmail: e.target.value }))}
                                        type="email"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
                                        placeholder="you@example.com" />
                                </div>

                                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider pt-1">Loan Details</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Amount (₹) *</label>
                                        <input value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                            type="number" min="1"
                                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
                                            placeholder="e.g. 50000" />
                                        {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Purpose *</label>
                                        <select value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-teal-500 transition-colors">
                                            <option value="">Select purpose…</option>
                                            {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                        {errors.purpose && <p className="text-red-400 text-xs mt-1">{errors.purpose}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Message <span className="text-gray-500">(optional)</span></label>
                                    <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                        rows={3} maxLength={1000}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors resize-none"
                                        placeholder="Briefly describe your situation…" />
                                </div>

                                <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300">
                                    🔒 Your phone number will be your <strong>tracking ID</strong>. Save it — you'll need it to check your request status and access the chat.
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={mutation.isPending}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-teal-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {mutation.isPending ? <><Loader2 className="w-5 h-5 animate-spin" />Submitting…</> : <>Submit Loan Request <ArrowRight className="w-5 h-5" /></>}
                                </button>
                            </motion.div>
                        )}

                        {/* ── Step 2: Success ── */}
                        {step === 2 && result && (
                            <motion.div key="step2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 flex flex-col items-center text-center gap-5">
                                <div className="w-20 h-20 rounded-full bg-teal-500/15 border-2 border-teal-500/40 flex items-center justify-center">
                                    <CheckCircle className="w-10 h-10 text-teal-400" />
                                </div>
                                <div>
                                    <h3 className="text-white text-2xl font-bold">Request Sent!</h3>
                                    <p className="text-gray-400 text-sm mt-1">Your loan request has been submitted to <strong className="text-white">{result.lenderName}</strong>.</p>
                                </div>

                                {/* Tracking info box */}
                                <div className="w-full bg-gray-800 border border-teal-500/30 rounded-2xl p-5 space-y-3 text-left">
                                    <p className="text-teal-400 text-xs font-bold uppercase tracking-wider">📋 Save This Information</p>
                                    <div>
                                        <p className="text-gray-400 text-xs">Your Tracking Phone Number</p>
                                        <p className="text-white text-xl font-bold tracking-widest mt-1">{result.trackingPhone}</p>
                                    </div>
                                    <p className="text-gray-500 text-xs leading-relaxed">
                                        Use this phone number to check your request status. Once the lender <strong className="text-white">accepts</strong> your request, a chat will become available.
                                    </p>
                                </div>

                                <div className="flex gap-3 w-full">
                                    <button onClick={onClose} className="flex-1 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors">
                                        Close
                                    </button>
                                    <button
                                        onClick={() => { onClose(); window.dispatchEvent(new CustomEvent('open-track-request', { detail: { phone: result.trackingPhone } })); }}
                                        className="flex-1 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl text-white text-sm font-bold hover:shadow-lg transition-all"
                                    >
                                        Check My Request →
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default PublicLoanFlow;
