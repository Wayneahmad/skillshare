// src/components/WalletCard.jsx
export default function WalletCard({
  available = 0,
  pending = 0,
  onTopUp,
  onSimulate, // optional (keeps your old demo button, tucked away)
  className = "",
}) {
  const total = (Number(available) || 0) + (Number(pending) || 0);
  const pct =
    total > 0 ? Math.min(100, Math.round((available / total) * 100)) : 0;

  return (
    <div
      className={
        "relative overflow-hidden rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-5 " +
        className
      }
    >
      {/* soft gradient accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-400/10 to-violet-400/10 dark:from-indigo-500/10 dark:to-violet-500/10"
      />

      <h2 className="text-lg font-semibold">Wallet</h2>
      <p className="mt-1 text-slate-600 dark:text-slate-300">Credits balance</p>

      <div className="mt-4 flex items-end gap-3">
        <div className="text-5xl leading-none font-bold">{available}</div>
        <div className="mb-1 text-slate-500 text-sm">
          available
          {pending > 0 && (
            <div className="mt-1 inline-flex items-center rounded-full bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200 px-2 py-0.5 text-xs">
              {pending} pending in escrow
            </div>
          )}
        </div>
      </div>

      {/* Progress bar: available vs total */}
      <div className="mt-4">
        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-2 rounded-full bg-slate-900 dark:bg-white"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-slate-500">
          <span>Available {pct}%</span>
          <span>Total {total}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={onTopUp}
          className="rounded-xl px-4 py-2 bg-slate-900 text-white hover:opacity-90"
        >
          Top up credits
        </button>
        {typeof onSimulate === "function" && (
          <button
            onClick={onSimulate}
            className="rounded-xl px-4 py-2 bg-white ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:ring-slate-700 dark:hover:bg-slate-800"
            title="Demo only"
          >
            Earn 3 credits (simulate)
          </button>
        )}
      </div>
    </div>
  );
}
