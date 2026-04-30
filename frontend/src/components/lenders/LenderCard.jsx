/**
 * LenderCard — Discovery UI card for a single lender
 */
const LenderCard = ({ lender, onSelect }) => {
    const city = lender.address?.city;
    const state = lender.address?.state;
    const location = [city, state].filter(Boolean).join(', ');

    return (
        <div className="group relative bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-6 hover:border-violet-500/60 hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/10 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start gap-4">
                {lender.logo ? (
                    <img
                        src={lender.logo}
                        alt={lender.businessName}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-600"
                    />
                ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {lender.businessName?.charAt(0) || 'L'}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-base truncate group-hover:text-violet-300 transition-colors">
                        {lender.businessName}
                    </h3>
                    <p className="text-slate-400 text-sm truncate">{lender.ownerName}</p>
                    {location && (
                        <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                            <span>📍</span> {location}
                        </p>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-400 mb-0.5">Interest Rate</p>
                    <p className="text-lg font-bold text-emerald-400">{lender.interestRate ?? 12}%</p>
                    <p className="text-xs text-slate-500">per annum</p>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-400 mb-0.5">Rating</p>
                    <p className="text-lg font-bold text-yellow-400 flex items-center justify-center gap-1">
                        ⭐ {(lender.rating ?? 4.0).toFixed(1)}
                    </p>
                    <p className="text-xs text-slate-500">out of 5</p>
                </div>
            </div>

            {/* Description */}
            {lender.description && (
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                    {lender.description}
                </p>
            )}

            {/* CTA */}
            <button
                onClick={() => onSelect(lender)}
                className="mt-auto w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25 active:scale-95"
            >
                Request Loan
            </button>
        </div>
    );
};

export default LenderCard;
