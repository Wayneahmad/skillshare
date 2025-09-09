// src/pages/Offers.jsx
import { useMemo, useState } from "react";
import { useApp } from "../context/AppState";
import { useAuth } from "../context/AuthContext";
import { CATEGORIES, categoryLabel } from "../lib/categories";

export default function Offers() {
  const {
    offers,
    createEscrow,
    toggleFavorite,
    isFavorite,
    getReviewsForOffer, // <-- from AppState
  } = useApp();
  const { user, addCredits, spendCredits, getNameById } = useAuth();

  // UI state
  const [selected, setSelected] = useState(null); // offer id (opens booking panel)
  const [hours, setHours] = useState(1);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("top"); // 'top' | 'reviews' | 'new' | 'priceAsc' | 'priceDesc' | 'creditsAsc' | 'creditsDesc'
  const [reviewsFor, setReviewsFor] = useState(null); // offer id for modal

  // Derived / helpers
  const selectedOffer = offers.find((o) => o.id === selected) || null;
  const safeHours = Math.max(1, Number(hours) || 1);
  const required = selectedOffer
    ? safeHours * (Number(selectedOffer.creditsPerHour) || 1)
    : 0;
  const balance = Number(user?.credits ?? 0);
  const shortBy = Math.max(0, required - balance);

  // Filter + sort
  const filteredSorted = useMemo(() => {
    let list = offers.slice();

    // text search
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((o) => {
        const providerName =
          (typeof getNameById === "function" && getNameById(o.userId)) ||
          o.userName ||
          o.userId;
        return (
          o.title?.toLowerCase().includes(q) ||
          o.desc?.toLowerCase().includes(q) ||
          providerName?.toLowerCase().includes(q)
        );
      });
    }

    // category filter
    if (cat !== "all")
      list = list.filter((o) => (o.category || "other") === cat);

    // sort
    switch (sort) {
      case "top":
        list.sort((a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0));
        break;
      case "reviews":
        list.sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0));
        break;
      case "new":
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        break;
      case "priceAsc":
        list.sort((a, b) => (a.gbpPerHour || 0) - (b.gbpPerHour || 0));
        break;
      case "priceDesc":
        list.sort((a, b) => (b.gbpPerHour || 0) - (a.gbpPerHour || 0));
        break;
      case "creditsAsc":
        list.sort((a, b) => (a.creditsPerHour || 0) - (b.creditsPerHour || 0));
        break;
      case "creditsDesc":
        list.sort((a, b) => (b.creditsPerHour || 0) - (a.creditsPerHour || 0));
        break;
      default:
        break;
    }

    return list;
  }, [offers, query, cat, sort, getNameById]);

  function lockEscrow() {
    try {
      if (!user || !selectedOffer) return;
      if (balance < required) return;

      spendCredits(required);
      createEscrow({
        offer: selectedOffer,
        buyerId: user.id,
        hours: safeHours,
      });

      setMessage(
        `Locked ${required} credits in escrow for “${selectedOffer.title}”. View it on your Dashboard.`
      );
      setSelected(null);
      setHours(1);
    } catch (err) {
      console.error("Failed to lock escrow:", err);
      setMessage("Something went wrong locking escrow. Please try again.");
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <section className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Browse offers
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Find trusted skills across categories. Book with credits — no cash
              needed.
            </p>
          </div>
          <div className="text-sm text-slate-500">
            {filteredSorted.length} result
            {filteredSorted.length !== 1 ? "s" : ""}
          </div>
        </div>
      </section>

      {/* Sticky filter bar */}
      <div className="sticky top-16 z-40 mt-4 rounded-xl border border-slate-200 bg-white/80 backdrop-blur dark:bg-slate-900/80 dark:border-slate-800">
        <div className="p-3 flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
          <div className="flex-1">
            <label className="sr-only" htmlFor="search">
              Search
            </label>
            <input
              id="search"
              placeholder="Search title, description, provider…"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>

            <select
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort by"
            >
              <option value="top">Top rated</option>
              <option value="reviews">Most reviewed</option>
              <option value="new">Newest</option>
              <option value="priceAsc">£/hr ↑</option>
              <option value="priceDesc">£/hr ↓</option>
              <option value="creditsAsc">Credits/hr ↑</option>
              <option value="creditsDesc">Credits/hr ↓</option>
            </select>

            {(query || cat !== "all" || sort !== "top") && (
              <button
                className="rounded-lg px-3 py-2 text-sm bg-white ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:ring-slate-700 dark:hover:bg-slate-800"
                onClick={() => {
                  setQuery("");
                  setCat("all");
                  setSort("top");
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {message && (
        <p className="mt-3 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 p-3">
          {message}
        </p>
      )}

      {/* Results */}
      {filteredSorted.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-slate-600 dark:text-slate-300">
          No offers match your filters. Try clearing filters or searching
          another term.
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSorted.map((o) => {
            const isSelf = !!user && user.id === o.userId;
            const providerName =
              (typeof getNameById === "function" && getNameById(o.userId)) ||
              o.userName ||
              o.userId;

            const hasRating =
              typeof o.ratingAvg === "number" && o.ratingCount > 0;

            const badge = ratingBadge(o.ratingAvg, o.ratingCount);

            const fav = user ? isFavorite(user.id, o.id) : false;

            return (
              <li
                key={o.id}
                className="group rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-4 transition shadow-sm hover:shadow-md"
              >
                {/* Card header: title + controls */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold leading-snug text-slate-900 dark:text-white line-clamp-1">
                        {o.title}
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {categoryLabel(o.category || "other")}
                      </span>
                    </div>

                    <div className="mt-1 text-xs text-slate-500 flex items-center gap-2">
                      {/* tiny avatar from initials */}
                      <span className="inline-grid place-items-center h-5 w-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300">
                        {String(providerName).charAt(0).toUpperCase()}
                      </span>
                      <span className="truncate">by {providerName}</span>

                      {/* rating pill */}
                      {hasRating ? (
                        <>
                          <span aria-hidden>•</span>
                          <span
                            className={
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ring-1 " +
                              badge.className
                            }
                            title={`${o.ratingAvg} average from ${
                              o.ratingCount
                            } review${o.ratingCount !== 1 ? "s" : ""}`}
                          >
                            ★ {o.ratingAvg} • {badge.label}
                          </span>
                          <button
                            className="ml-1 text-indigo-600 hover:underline"
                            onClick={() => setReviewsFor(o.id)}
                          >
                            Reviews ({o.ratingCount})
                          </button>
                        </>
                      ) : (
                        <>
                          <span aria-hidden>•</span>
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-200 dark:ring-indigo-700/40">
                            New
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Favorite */}
                  <button
                    className="shrink-0 inline-flex items-center justify-center h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => user && toggleFavorite(user.id, o.id)}
                    title={fav ? "Remove from saved" : "Save for later"}
                    disabled={!user || isSelf}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      className={fav ? "fill-rose-500" : "fill-none"}
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M12 21s-6.7-4.2-9.4-7.1A5.7 5.7 0 0 1 12 5.3a5.7 5.7 0 0 1 9.4 8.6C18.7 16.8 12 21 12 21z" />
                    </svg>
                  </button>
                </div>

                {/* Description */}
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

                {/* Booking panel or Button */}
                {selected === o.id ? (
                  <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                    {!user ? (
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Please log in to book.
                      </p>
                    ) : isSelf ? (
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        You can’t book your own offer.
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
                                setHours(
                                  Math.max(1, Number(e.target.value) || 1)
                                )
                              }
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">
                              Required credits
                            </label>
                            <div className="h-[42px] grid place-items-center rounded-lg border border-slate-300 dark:border-slate-700">
                              <span className="font-medium">{required}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 text-sm">
                          <div>
                            Available:{" "}
                            <span className="font-medium">{balance}</span>
                          </div>
                          {shortBy > 0 && (
                            <div className="text-amber-700 dark:text-amber-400">
                              Short by {shortBy} credit
                              {shortBy !== 1 ? "s" : ""}.
                            </div>
                          )}
                        </div>

                        {shortBy > 0 ? (
                          <div className="mt-3 flex flex-col gap-2">
                            <button
                              onClick={() => addCredits(3)}
                              className="rounded-lg px-4 py-2 bg-indigo-600 text-white hover:opacity-90"
                              title="Prototype: simulate completing a task"
                            >
                              Earn 3 credits (simulate)
                            </button>
                            <button
                              onClick={() => addCredits(10)}
                              className="rounded-lg px-4 py-2 bg-slate-900 text-white hover:opacity-90"
                              title="Prototype: fake checkout £100 → 10 credits"
                            >
                              Top up 10 credits (£100)
                            </button>
                            <button
                              onClick={() => setSelected(null)}
                              className="rounded-lg px-4 py-2 bg-white ring-1 ring-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:ring-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={lockEscrow}
                              className="flex-1 rounded-lg px-4 py-2 bg-slate-900 text-white hover:opacity-90"
                            >
                              Lock credits in ESCROW
                            </button>
                            <button
                              onClick={() => setSelected(null)}
                              className="flex-1 rounded-lg px-4 py-2 bg-white ring-1 ring-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:ring-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <button
                    className="mt-3 w-full rounded-xl px-4 py-2 bg-slate-900 text-white hover:opacity-90 disabled:opacity-40"
                    onClick={() => {
                      setSelected(o.id);
                      setHours(1);
                    }}
                    disabled={!!user && user.id === o.userId}
                    title={
                      !!user && user.id === o.userId
                        ? "You can't book your own offer"
                        : "Book this offer"
                    }
                  >
                    {!!user && user.id === o.userId ? "Your offer" : "Book"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Reviews drawer/modal */}
      {reviewsFor && (
        <ReviewsModal
          onClose={() => setReviewsFor(null)}
          title={
            offers.find((x) => x.id === reviewsFor)?.title || "Service reviews"
          }
          reviews={getReviewsForOffer(reviewsFor)}
        />
      )}
    </main>
  );
}

/* ---------- UI helpers ---------- */

function ratingBadge(avg, count) {
  if (!count || typeof avg !== "number") {
    return {
      label: "New",
      className:
        "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-200 dark:ring-indigo-700/40",
    };
  }
  if (avg >= 4.7)
    return {
      label: "Excellent",
      className:
        "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:ring-emerald-700/40",
    };
  if (avg >= 4.2)
    return {
      label: "Great",
      className:
        "bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-900/20 dark:text-teal-200 dark:ring-teal-700/40",
    };
  if (avg >= 3.6)
    return {
      label: "Good",
      className:
        "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-900/20 dark:text-sky-200 dark:ring-sky-700/40",
    };
  if (avg >= 3.0)
    return {
      label: "Fair",
      className:
        "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:ring-amber-700/40",
    };
  return {
    label: "Mixed",
    className:
      "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-900/20 dark:text-rose-200 dark:ring-rose-700/40",
  };
}

/* Simple modal for reviews */
function ReviewsModal({ title, reviews = [], onClose }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <h4 className="text-lg font-semibold">{title}</h4>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>

        <div className="max-h-[60vh] overflow-auto divide-y divide-slate-100 dark:divide-slate-800">
          {reviews.length === 0 ? (
            <div className="p-4 text-sm text-slate-600 dark:text-slate-300">
              No reviews yet.
            </div>
          ) : (
            reviews.map((r, i) => (
              <div key={i} className="p-4">
                <div className="flex items-center gap-2">
                  <Stars value={r.rating} />
                  <span className="text-xs text-slate-500">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {r.text && (
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                    {r.text}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* Read-only stars for reviews list */
function Stars({ value = 0 }) {
  return (
    <div className="inline-flex items-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          className={i <= value ? "text-amber-500" : "text-slate-300"}
        >
          <path
            d="M12 17.27l6.18 3.73-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"
            fill="currentColor"
          />
        </svg>
      ))}
    </div>
  );
}
