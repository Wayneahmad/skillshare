// src/components/SavedServicesPanel.jsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useApp } from "../context/AppState.jsx";
import { categoryLabel } from "../lib/categories";

export default function SavedServicesPanel() {
  const { user, addCredits, spendCredits } = useAuth();
  const { getFavorites, toggleFavorite, createEscrow } = useApp();

  const [openId, setOpenId] = useState(null);
  const [hours, setHours] = useState(1);
  const [flash, setFlash] = useState("");

  if (!user) return null;

  const favorites = useMemo(
    () => getFavorites(user.id) || [],
    [getFavorites, user.id]
  );

  // if the currently open service is removed, close the panel
  useEffect(() => {
    if (openId && !favorites.some((o) => o.id === openId)) {
      setOpenId(null);
      setFlash("");
    }
  }, [favorites, openId]);

  function startRebook(offerId) {
    setOpenId(offerId);
    setHours(1);
    setFlash("");
  }

  function cancelPanel() {
    setOpenId(null);
    setFlash("");
  }

  function lockEscrow(offer) {
    const hrs = Math.max(1, Number(hours) || 1);
    const rate = Math.max(1, Number(offer.creditsPerHour) || 1);
    const required = hrs * rate;
    const balance = Number(user.credits ?? 0);

    if (balance < required) {
      setFlash(
        `You need ${required} credits to rebook (you have ${balance}). Top up or earn credits first.`
      );
      return;
    }

    // Deduct & create escrow instantly (demo-style)
    spendCredits(required);
    createEscrow({ offer, buyerId: user.id, hours: hrs });

    setFlash(
      `Rebooked “${offer.title}” for ${hrs}h — ${required} credits locked in escrow.`
    );
    setTimeout(() => {
      setOpenId(null);
      setFlash("");
    }, 900);
  }

  if (favorites.length === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Saved services</h3>
        <span className="text-xs rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-600 dark:text-slate-300">
          {favorites.length}
        </span>
      </div>

      {flash && (
        <p className="mt-3 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 p-3 text-sm">
          {flash}
        </p>
      )}

      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {favorites.map((o) => {
          const category = categoryLabel(o.category || "other");
          const hasRating =
            typeof o.ratingAvg === "number" && o.ratingCount > 0;
          const trusted = hasRating && o.ratingCount >= 3 && o.ratingAvg >= 4.5;
          const isSelf = user.id === o.userId;
          const required =
            Math.max(1, Number(hours) || 1) * (Number(o.creditsPerHour) || 1);

          return (
            <li
              key={o.id}
              className="group rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-4 transition shadow-sm hover:shadow-md"
            >
              {/* Header: title + category + unfave */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium text-slate-900 dark:text-white line-clamp-1">
                    {o.title}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {category}
                    </span>
                    {hasRating && (
                      <span className="ml-2">
                        ★ {o.ratingAvg} ({o.ratingCount})
                      </span>
                    )}
                    {trusted && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-200">
                        Trusted
                      </span>
                    )}
                  </div>
                </div>

                <button
                  title="Remove from saved"
                  onClick={() => toggleFavorite(user.id, o.id)}
                  className="shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {/* filled heart */}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-rose-500"
                  >
                    <path d="M12 21s-6.716-4.686-9.428-7.4a5.5 5.5 0 118.071-8.071L12 4.886l1.357-1.357a5.5 5.5 0 118.071 8.071C18.716 16.314 12 21 12 21z" />
                  </svg>
                </button>
              </div>

              {/* Desc */}
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                {o.desc}
              </p>

              {/* Price row */}
              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm text-slate-700 dark:text-slate-200">
                  £{o.gbpPerHour}/hr
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700">
                  {o.creditsPerHour} credits/hr
                </span>
              </div>

              {/* Actions */}
              {openId === o.id ? (
                <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                  {isSelf ? (
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      You can’t book your own service.
                    </p>
                  ) : (
                    <>
                      <div className="flex items-end gap-3">
                        <div className="flex-1">
                          <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">
                            Hours
                          </label>
                          <input
                            type="number"
                            min={1}
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
                            value={hours}
                            onChange={(e) =>
                              setHours(Math.max(1, Number(e.target.value) || 1))
                            }
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">
                            Required
                          </label>
                          <div className="h-[42px] grid place-items-center rounded-lg border border-slate-300 dark:border-slate-700">
                            <span className="font-medium">{required}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => lockEscrow(o)}
                          className="rounded-lg px-4 py-2 bg-slate-900 text-white hover:opacity-90"
                        >
                          Lock in ESCROW
                        </button>
                        <button
                          onClick={() => addCredits(10)}
                          className="rounded-lg px-4 py-2 bg-indigo-600 text-white hover:opacity-90"
                          title="Prototype: £100 → 10 credits"
                        >
                          Top up +10
                        </button>
                        <button
                          onClick={() => addCredits(3)}
                          className="rounded-lg px-4 py-2 bg-white ring-1 ring-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:ring-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                          title="Prototype: simulate earning"
                        >
                          Earn +3
                        </button>
                        <button
                          onClick={cancelPanel}
                          className="ml-auto rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => startRebook(o.id)}
                    className="flex-1 rounded-lg px-4 py-2 bg-slate-900 text-white hover:opacity-90 disabled:opacity-40"
                    disabled={isSelf}
                    title={
                      isSelf
                        ? "You can't book your own offer"
                        : "Rebook quickly"
                    }
                  >
                    Rebook
                  </button>
                  <button
                    onClick={() => toggleFavorite(user.id, o.id)}
                    className="rounded-lg px-3 py-2 bg-white ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:ring-slate-700 dark:hover:bg-slate-800"
                    title="Remove from saved"
                  >
                    Unsave
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
