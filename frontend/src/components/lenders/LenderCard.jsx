import { Star, MapPin } from 'lucide-react';

/**
 * LenderCard — Discovery UI card for a single lender
 */
const LenderCard = ({ lender, onSelect }) => {
    const city = lender.address?.city;
    const state = lender.address?.state;
    const location = [city, state].filter(Boolean).join(', ');

    return (
        <div className="group relative bg-white dark:bg-surface-elevated border border-hairline-light dark:border-hairline-dark rounded-2xl p-5 hover:border-gray-300 dark:hover:border-hairline-dark-hover transition-all flex flex-col gap-4 shadow-xs">
            {/* Header */}
            <div className="flex items-start gap-3.5">
                {lender.logo ? (
                    <img
                        src={lender.logo}
                        alt={lender.businessName}
                        className="w-12 h-12 rounded-xl object-cover border border-hairline-light dark:border-hairline-dark"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 border border-primary/20 flex items-center justify-center text-primary dark:text-primary-light font-bold text-lg flex-shrink-0">
                        {lender.businessName?.charAt(0) || 'L'}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate">
                        {lender.businessName}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs truncate mt-0.5">{lender.ownerName}</p>
                    {location && (
                        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" /> {location}
                        </p>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-gray-50/80 dark:bg-canvas-dark/40 border border-hairline-light dark:border-hairline-dark rounded-xl p-2.5 text-center">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">Interest Rate</p>
                    <p className="text-base font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                        {lender.interestRate ?? 12}%
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">per annum</p>
                </div>
                <div className="bg-gray-50/80 dark:bg-canvas-dark/40 border border-hairline-light dark:border-hairline-dark rounded-xl p-2.5 text-center">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">Rating</p>
                    <p className="text-base font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {(lender.rating ?? 4.0).toFixed(1)}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">verified</p>
                </div>
            </div>

            {/* Description */}
            {lender.description && (
                <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed line-clamp-2">
                    {lender.description}
                </p>
            )}

            {/* CTA */}
            <button
                onClick={() => onSelect(lender)}
                className="mt-auto w-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
            >
                Request Loan
            </button>
        </div>
    );
};

export default LenderCard;
