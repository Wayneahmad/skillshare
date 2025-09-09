// src/components/BookingCard.jsx
import { useMemo, useState, useRef, useEffect, forwardRef } from "react";

/**
 * Props:
 * role: 'buyer' | 'provider'
 * escrow, offer, partnerName
 * onAccept(), onReject(reason), onCancel(reason)
 * onMarkComplete()
 * onEditHours(newHours)
 * onChatOpened(), onSendMessage(text)
 * onLeaveReview(rating, text)
 * onRebook?({ offer, hours })   // NEW: called only when released + role buyer
 */
export default function BookingCard({
  role,
  escrow,
  offer,
  partnerName,
  onAccept,
  onReject,
  onCancel,
  onMarkComplete,
  onEditHours,
  onChatOpened,
  onSendMessage,
  onLeaveReview,
  onRebook,
}) {
  const [chatOpen, setChatOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirm, setConfirm] = useState(null); // 'cancel' | 'reject'
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [reviewDismissed, setReviewDismissed] = useState(false); // NEW
  const menuRef = useRef(null);
  const prevStatusRef = useRef(escrow?.status);

  const {
    status,
    acceptBuyer,
    acceptProvider,
    doneBuyer,
    doneProvider,
    amountCredits,
    hours,
    messages = [],
    unreadByBuyer = 0,
    unreadByProvider = 0,
    review,
  } = escrow || {};

  const youAreBuyer = role === "buyer";
  const unread = youAreBuyer ? unreadByBuyer : unreadByProvider;

  useEffect(() => {
    if (prevStatusRef.current !== "released" && status === "released") {
      setShowCelebrate(true);
      const t = setTimeout(() => setShowCelebrate(false), 1200);
      return () => clearTimeout(t);
    }
    prevStatusRef.current = status;
  }, [status]);

  useEffect(() => {
    function onDoc(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const isRequested = status === "locked";
  const isAccepted = status === "accepted";
  const isCancelled = status === "cancelled";
  const isReleased = status === "released";

  const canAccept = !youAreBuyer && isRequested && !acceptProvider;
  const canReject = !youAreBuyer && isRequested && !acceptProvider;
  const canAdjustHours = youAreBuyer && isRequested;
  const canCancel = !isCancelled && !isReleased && !(doneBuyer || doneProvider);
  const canMarkDelivered = !youAreBuyer && isAccepted && !doneProvider;
  const canConfirmComplete =
    youAreBuyer && isAccepted && doneProvider && !doneBuyer;

  const primary = useMemo(() => {
    if (canAccept)
      return { label: "Accept booking", kind: "primary", on: onAccept };
    if (canMarkDelivered)
      return { label: "Mark delivered", kind: "primary", on: onMarkComplete };
    if (canConfirmComplete)
      return { label: "Confirm complete", kind: "primary", on: onMarkComplete };
    return {
      label: unread > 0 ? `Open chat (${unread})` : "Open chat",
      kind: "ghost",
      on: () => {
        setChatOpen((v) => !v);
        if (!chatOpen && onChatOpened) onChatOpened();
      },
    };
    // include all handler deps we reference for freshness
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    canAccept,
    canMarkDelivered,
    canConfirmComplete,
    unread,
    chatOpen,
    onAccept,
    onMarkComplete,
    onChatOpened,
  ]);

  const btn = {
    base: "inline-flex items-center justify-center rounded-lg text-sm font-medium transition",
    primary: "px-3 py-1.5 bg-slate-900 text-white hover:opacity-90",
    ghost:
      "px-3 py-1.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
    secondary:
      "px-3 py-1.5 bg-white ring-1 ring-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:ring-slate-700 dark:text-slate-200 dark:hover:bg-slate-800",
    tiny: "px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700",
  };

  // ---- PROGRESS ROW (consistent styling + current step highlight) ----
  const stepState = useMemo(() => {
    const requestedDone = true;
    const acceptedDone = acceptBuyer && acceptProvider;
    const deliveredDone = !!doneProvider;
    const releasedDone = isReleased;

    // the first not-done becomes "current"
    const steps = [
      { key: "Requested", done: requestedDone },
      { key: "Accepted", done: acceptedDone },
      { key: "Delivered", done: deliveredDone },
      { key: "Released", done: releasedDone },
    ];
    const firstNotDone = steps.find((s) => !s.done);
    return steps.map((s) => ({
      ...s,
      current: firstNotDone ? firstNotDone.key === s.key : false,
    }));
  }, [acceptBuyer, acceptProvider, doneProvider, isReleased]);

  function handleAdjustHours() {
    const val = window.prompt("New hours?", String(hours || 1));
    if (!val) return;
    const n = Math.max(1, Number(val) || 1);
    onEditHours && onEditHours(n);
  }
  function handleSend() {
    const text = (msg || "").trim();
    if (!text) return;
    onSendMessage && onSendMessage(text);
    setMsg("");
  }

  const stateBadge = isCancelled ? (
    <Pill tone="amber">Cancelled</Pill>
  ) : isReleased ? (
    <Pill tone="green">Completed</Pill>
  ) : isAccepted ? (
    <Pill>Accepted</Pill>
  ) : (
    <Pill>Requested</Pill>
  );

  return (
    <li className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-4">
      {/* completion banner */}
      {showCelebrate && (
        <div className="mb-3 overflow-hidden">
          <div className="rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-200 px-3 py-2 text-sm translate-y-0 transition-all duration-500">
            ✓ Booking completed — credits released to the provider.
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-semibold leading-snug text-slate-900 dark:text-white line-clamp-2">
              {offer?.title || "Untitled"}
            </h4>
            {stateBadge}
          </div>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {hours}h · {amountCredits} credit{amountCredits !== 1 ? "s" : ""}
            <span className="mx-2 text-slate-400" aria-hidden>
              •
            </span>
            With: {partnerName || "—"}
          </div>
        </div>

        <MoreMenu
          ref={menuRef}
          open={menuOpen}
          setOpen={setMenuOpen}
          items={[
            canAdjustHours && {
              label: "Adjust hours",
              onClick: handleAdjustHours,
            },
            canAccept && { label: "Accept booking", onClick: onAccept },
            canReject && {
              label: "Reject booking",
              onClick: () => setConfirm("reject"),
            },
            canCancel && {
              label: "Cancel booking",
              danger: true,
              onClick: () => setConfirm("cancel"),
            },
            { divider: true },
            {
              label: detailsOpen ? "Hide details" : "View details",
              onClick: () => setDetailsOpen((v) => !v),
            },
          ].filter(Boolean)}
        />
      </div>

      {/* Primary row */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          className={`${btn.base} ${
            primary.kind === "primary" ? btn.primary : btn.ghost
          }`}
          onClick={primary.on}
        >
          {primary.label}
        </button>

        {/* Rebook (history + buyer only) */}
        {isReleased && youAreBuyer && typeof onRebook === "function" && (
          <button
            className={`${btn.base} ${btn.secondary}`}
            onClick={() => onRebook({ offer, hours })}
            title="Rebook this service"
          >
            Rebook
          </button>
        )}

        {(canAccept || canMarkDelivered || canConfirmComplete) && (
          <button
            className={`${btn.base} ${btn.ghost}`}
            onClick={() => {
              setChatOpen((v) => !v);
              if (!chatOpen && onChatOpened) onChatOpened();
            }}
          >
            {unread > 0 ? `Open chat (${unread})` : "Open chat"}
          </button>
        )}
      </div>

      {/* Progress badges */}
      <div className="mt-3">
        <div className="inline-flex flex-wrap gap-1.5">
          {stepState.map((s) => (
            <Step
              key={s.key}
              variant={s.done ? "done" : s.current ? "current" : "upcoming"}
            >
              {s.key}
            </Step>
          ))}
        </div>
      </div>

      {/* Details */}
      {detailsOpen && (
        <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-600 dark:text-slate-300">
          Keep chatting to arrange specifics. Once delivered, the provider marks
          “delivered”, then you confirm. Credits release automatically.
        </div>
      )}

      {/* Chat */}
      {chatOpen && (
        <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="max-h-48 overflow-auto divide-y divide-slate-100 dark:divide-slate-800">
            {messages.length === 0 ? (
              <div className="p-3 text-sm text-slate-500">No messages yet.</div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="p-3 text-sm">
                  <div className="text-slate-500">
                    <strong className="text-slate-700 dark:text-slate-200">
                      {m.senderName || m.senderId}
                    </strong>{" "}
                    <span className="text-xs">
                      {new Date(m.ts).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1">{m.text}</div>
                </div>
              ))
            )}
          </div>
          <div className="p-3 flex items-center gap-2">
            <input
              className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              placeholder="Type a message…"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              className={`${btn.base} ${btn.primary}`}
              onClick={handleSend}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Inline review (buyer after release) */}
      {isReleased &&
        role === "buyer" &&
        !review &&
        !reviewDismissed &&
        onLeaveReview && (
          <ReviewPanel
            onSubmit={(r, t) => onLeaveReview(r, t)}
            onLater={() => setReviewDismissed(true)}
          />
        )}

      {isReleased && review && role === "buyer" && (
        <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
          <Stars value={review.rating} readOnly />
          {review.text && (
            <div className="mt-1 text-slate-700 dark:text-slate-200">
              {review.text}
            </div>
          )}
        </div>
      )}

      {/* Confirms */}
      {confirm && (
        <ConfirmModal
          title={confirm === "cancel" ? "Cancel booking" : "Reject booking"}
          danger={confirm === "cancel"}
          actionLabel={confirm === "cancel" ? "Cancel booking" : "Reject"}
          onClose={() => setConfirm(null)}
          onConfirm={(reason) => {
            if (confirm === "cancel") onCancel && onCancel(reason);
            else onReject && onReject(reason);
            setConfirm(null);
          }}
        />
      )}
    </li>
  );
}

/* ---------- UI atoms ---------- */

function Pill({ children, tone = "slate" }) {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1";
  const styles =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:ring-emerald-700/50"
      : tone === "amber"
      ? "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:ring-amber-700/50"
      : "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700";
  return <span className={`${base} ${styles}`}>{children}</span>;
}

/** status step token */
function Step({ variant = "upcoming", children }) {
  const styles =
    variant === "done"
      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
      : variant === "current"
      ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-200 dark:ring-indigo-700/40"
      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${styles}`}
    >
      {children}
    </span>
  );
}

const MoreMenu = forwardRef(function MoreMenu({ items, open, setOpen }, ref) {
  return (
    <div className="relative" ref={ref}>
      <button
        className="inline-flex items-center justify-center rounded-lg px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        title="More"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="5" cy="12" r="2" fill="currentColor" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <circle cx="19" cy="12" r="2" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:bg-slate-900 dark:border-slate-800 z-10"
        >
          {items.map((it, i) =>
            it.divider ? (
              <div
                key={`div-${i}`}
                className="h-px bg-slate-200 dark:bg-slate-800"
              />
            ) : (
              <button
                key={it.label}
                role="menuitem"
                onClick={it.onClick}
                className={
                  "w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 " +
                  (it.danger
                    ? "text-rose-600"
                    : "text-slate-700 dark:text-slate-200")
                }
              >
                {it.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
});

/** Stars (display & interactive) */
function Stars({ value = 0, onChange, readOnly = false }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  const Star = ({ i }) => (
    <button
      type="button"
      aria-label={`${i} star`}
      disabled={readOnly}
      onMouseEnter={() => !readOnly && setHover(i)}
      onMouseLeave={() => !readOnly && setHover(0)}
      onClick={() => !readOnly && onChange && onChange(i)}
      className={(readOnly ? "cursor-default" : "cursor-pointer") + " p-0.5"}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" className="transition">
        <path
          d="M12 17.27l6.18 3.73-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"
          fill={i <= active ? "currentColor" : "none"}
          stroke="currentColor"
          className={i <= active ? "text-amber-500" : "text-slate-300"}
        />
      </svg>
    </button>
  );
  return (
    <div className="inline-flex items-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} i={i} />
      ))}
    </div>
  );
}

/** Inline review panel */
function ReviewPanel({ onSubmit, onLater }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  return (
    <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-900 dark:text-white">
          Rate this service
        </div>
        <Stars value={rating} onChange={setRating} />
      </div>
      <textarea
        rows={3}
        className="mt-2 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
        placeholder="Share a quick note…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="mt-2 flex items-center justify-end gap-2">
        <button
          className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm bg-white ring-1 ring-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:ring-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          onClick={onLater}
          title="Later"
        >
          Later
        </button>
        <button
          className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm bg-slate-900 text-white hover:opacity-90"
          onClick={() => {
            const r = Math.max(1, Math.min(5, Number(rating) || 5));
            onSubmit(r, text.trim());
          }}
        >
          Submit review
        </button>
      </div>
    </div>
  );
}

function ConfirmModal({ title, actionLabel, danger, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const btn =
    "inline-flex items-center justify-center rounded-lg text-sm font-medium transition";
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
        <h4 className="text-lg font-semibold">{title}</h4>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Add an optional reason.
        </p>
        <textarea
          rows={3}
          className="mt-3 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="mt-3 flex justify-end gap-2">
          <button
            className={`${btn} px-3 py-1.5 bg-white ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:ring-slate-700`}
            onClick={onClose}
          >
            Close
          </button>
          <button
            className={
              btn +
              " px-3 py-1.5 " +
              (danger
                ? "bg-rose-600 text-white hover:opacity-90"
                : "bg-slate-900 text-white hover:opacity-90")
            }
            onClick={() => onConfirm(reason)}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
