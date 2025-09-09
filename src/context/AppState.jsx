// src/context/AppState.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { load, save } from "../lib/storage";

const AppState = createContext(null);
const KEY = "skillshare_app_v5";

/*
Escrow (single source of truth for payout):
{
  id, offerId, buyerId, providerId,
  hours, amountCredits,
  status: 'locked' | 'accepted' | 'released' | 'cancelled',
  acceptBuyer, acceptProvider,
  doneBuyer, doneProvider,
  payoutDone?: boolean,
  cancelReason?: string,
  // booking-local
  sessionDesc: string,
  gbpPerHour: number,
  review?: { rating: number, text: string, reviewerId: string, createdAt: number },
  messages: [{ id, senderId, senderName, text, ts }],
  unreadByBuyer: number,
  unreadByProvider: number,
  createdAt
}

Offer:
{
  id, userId, userName, title, desc, category, gbpPerHour, creditsPerHour, createdAt,
  ratingCount?: number,
  ratingAvg?: number
}
*/

const GBP_PER_CREDIT = 10;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
function deriveCreditsPerHour(gbpPerHour) {
  return clamp(Math.round((Number(gbpPerHour) || 0) / GBP_PER_CREDIT), 1, 10);
}

function uid() {
  return `id_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(
    36
  )}`;
}
const int = (n, d = 0) => {
  const v = Math.floor(Number(n));
  return Number.isFinite(v) ? v : d;
};

function loadState() {
  const v = load(KEY, { offers: [], escrows: [], favorites: {} });
  return {
    offers: Array.isArray(v.offers) ? v.offers : [],
    escrows: Array.isArray(v.escrows) ? v.escrows : [],
    favorites: v.favorites || {},
  };
}

function seedOnce() {
  const seeded = load("__skillshare_seeded_v5", false);
  if (!seeded) save("__skillshare_seeded_v5", true);
  return !seeded;
}

export function AppStateProvider({ children }) {
  const initial = loadState();
  const [offers, setOffers] = useState(initial.offers);
  const [escrows, setEscrows] = useState(initial.escrows);
  const [favorites, setFavorites] = useState(initial.favorites || {});

  // ✅ persist all state, including favorites
  useEffect(() => {
    save(KEY, { offers, escrows, favorites });
  }, [offers, escrows, favorites]);

  useEffect(() => {
    if (seedOnce() && offers.length === 0) {
      setOffers([
        {
          id: uid(),
          userId: "u_seed_alex",
          userName: "Alex (DevOps)",
          title: "AWS cost review",
          desc: "Audit bill + savings tips.",
          category: "tech",
          gbpPerHour: 80,
          creditsPerHour: deriveCreditsPerHour(80),
          ratingCount: 0,
          ratingAvg: 0,
          createdAt: Date.now(),
        },
        {
          id: uid(),
          userId: "u_seed_jo",
          userName: "Jo (Design)",
          title: "Brand polish session",
          desc: "1h design review & tweaks.",
          category: "creative",
          gbpPerHour: 50,
          creditsPerHour: deriveCreditsPerHour(50),
          ratingCount: 0,
          ratingAvg: 0,
          createdAt: Date.now(),
        },
      ]);
    }
  }, []); // seed once

  /* ---------------- Offers ---------------- */

  const publishOffer = (offer) =>
    setOffers((o) => [
      {
        ...offer,
        id: uid(),
        category: offer.category || "other",
        gbpPerHour: int(offer.gbpPerHour, 0),
        creditsPerHour: deriveCreditsPerHour(offer.gbpPerHour),
        ratingCount: 0,
        ratingAvg: 0,
        createdAt: offer.createdAt ?? Date.now(),
      },
      ...o,
    ]);

  // Provider edits: title/desc/£hr only (ignore creditsPerHour)
  function updateOffer(id, patch) {
    setOffers((o) =>
      o.map((of) => {
        if (of.id !== id) return of;
        const next = { ...of };

        if (patch.title !== undefined) next.title = String(patch.title);
        if (patch.desc !== undefined) next.desc = String(patch.desc);

        if (patch.gbpPerHour !== undefined) {
          const gbp = int(patch.gbpPerHour, 0);
          next.gbpPerHour = gbp;
          next.creditsPerHour = deriveCreditsPerHour(gbp);
        }

        if (patch.category !== undefined) {
          next.category = String(patch.category) || "other";
        }

        return next;
      })
    );
  }

  // -------- Favorites ----------
  function toggleFavorite(userId, offerId) {
    if (!userId || !offerId) return;
    setFavorites((prev) => {
      const cur = new Set(prev[userId] || []);
      cur.has(offerId) ? cur.delete(offerId) : cur.add(offerId);
      return { ...prev, [userId]: Array.from(cur) };
    });
  }

  function isFavorite(userId, offerId) {
    return !!(favorites[userId] || []).includes(offerId);
  }

  function getFavorites(userId) {
    const ids = new Set(favorites[userId] || []);
    return offers.filter((o) => ids.has(o.id));
  }

  // -------- Reviews (for offer modal) ----------
  function getReviewsForOffer(offerId) {
    return escrows
      .filter(
        (e) => e.offerId === offerId && e.status === "released" && e.review
      )
      .map((e) => ({
        rating: e.review.rating,
        text: e.review.text,
        reviewerId: e.review.reviewerId,
        createdAt: e.review.createdAt,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /* -------------- Booking / Escrow -------------- */

  function createEscrow({ offer, buyerId, hours }) {
    const hrs = Math.max(1, int(hours, 1));
    const rate = Math.max(1, int(offer.creditsPerHour, 1));
    const e = {
      id: uid(),
      offerId: offer.id,
      buyerId,
      providerId: offer.userId,
      hours: hrs,
      amountCredits: hrs * rate,
      status: "locked",
      acceptBuyer: true,
      acceptProvider: false,
      doneBuyer: false,
      doneProvider: false,
      payoutDone: false,
      refundDone: false,
      sessionDesc: "",
      gbpPerHour: int(offer.gbpPerHour, 0),
      messages: [],
      unreadByBuyer: 0,
      unreadByProvider: 0,
      createdAt: Date.now(),
    };
    setEscrows((arr) => [e, ...arr]);
    return e;
  }

  function addMessage(escrowId, { senderId, senderName, text }) {
    const clean = String(text || "").trim();
    if (!clean) return;
    setEscrows((arr) =>
      arr.map((e) => {
        if (e.id !== escrowId) return e;
        const isBuyer = senderId === e.buyerId;
        const msg = {
          id: uid(),
          senderId,
          senderName,
          text: clean,
          ts: Date.now(),
        };
        return {
          ...e,
          messages: [...(e.messages || []), msg],
          unreadByBuyer: !isBuyer
            ? (e.unreadByBuyer || 0) + 1
            : e.unreadByBuyer || 0,
          unreadByProvider: isBuyer
            ? (e.unreadByProvider || 0) + 1
            : e.unreadByProvider || 0,
        };
      })
    );
  }

  function markChatRead(escrowId, userId) {
    setEscrows((arr) =>
      arr.map((e) => {
        if (e.id !== escrowId) return e;
        if (userId === e.buyerId) return { ...e, unreadByBuyer: 0 };
        if (userId === e.providerId) return { ...e, unreadByProvider: 0 };
        return e;
      })
    );
  }

  function acceptEscrow(id, who /* 'buyer' | 'provider' */) {
    setEscrows((arr) =>
      arr.map((e) => {
        if (e.id !== id || e.status === "cancelled" || e.status === "released")
          return e;
        const next = {
          ...e,
          acceptBuyer: who === "buyer" ? true : e.acceptBuyer,
          acceptProvider: who === "provider" ? true : e.acceptProvider,
        };
        if (next.acceptBuyer && next.acceptProvider && next.status === "locked")
          next.status = "accepted";
        return next;
      })
    );
  }

  function cancelEscrow(
    id,
    { reason, currentUserId, addCredits, creditOther }
  ) {
    let refunded = null; // { buyerId, amount }

    setEscrows((arr) =>
      arr.map((e) => {
        if (e.id !== id) return e;
        if (e.status === "released" || e.status === "cancelled" || e.refundDone)
          return e;

        const workStarted =
          e.status === "accepted" && (e.doneProvider || e.doneBuyer);
        if (workStarted) return e; // cannot refund after delivery/confirm started

        refunded = { buyerId: e.buyerId, amount: int(e.amountCredits, 0) };
        return {
          ...e,
          status: "cancelled",
          refundDone: true, // <-- guard: refund only once
          cancelReason: reason?.trim() || undefined,
        };
      })
    );

    if (refunded) {
      // credit buyer exactly once, regardless of who clicked cancel
      if (
        refunded.buyerId === currentUserId &&
        typeof addCredits === "function"
      ) {
        addCredits(refunded.amount);
      } else if (typeof creditOther === "function") {
        creditOther(refunded.buyerId, refunded.amount);
      }
    }
  }

  function completeEscrow(id, who, { currentUserId, addCredits, creditOther }) {
    let payout = null;

    setEscrows((arr) =>
      arr.map((e) => {
        if (e.id !== id || e.status !== "accepted") return e;
        const next = {
          ...e,
          doneBuyer: who === "buyer" ? true : e.doneBuyer,
          doneProvider: who === "provider" ? true : e.doneProvider,
        };
        if (next.doneBuyer && next.doneProvider && !next.payoutDone) {
          next.status = "released";
          next.payoutDone = true;
          payout = {
            providerId: next.providerId,
            amount: Math.max(1, int(next.amountCredits, 1)),
          };
        }
        return next;
      })
    );

    if (payout) {
      if (
        payout.providerId === currentUserId &&
        typeof addCredits === "function"
      )
        addCredits(payout.amount);
      else if (typeof creditOther === "function")
        creditOther(payout.providerId, payout.amount);
    }
  }

  // Buyer can change HOURS while locked; wallet delta handled here
  function amendEscrow(
    id,
    newHours,
    { getBalanceById, currentUserId, addCredits, spendCredits }
  ) {
    const cur = escrows.find((x) => x.id === id);
    if (!cur) return { ok: false, error: "Not found" };
    if (cur.status !== "locked" || cur.buyerId !== currentUserId)
      return {
        ok: false,
        error: "Only pending bookings can be edited by the buyer",
      };

    const offer = offers.find((o) => o.id === cur.offerId);
    const rate = Math.max(1, int(offer?.creditsPerHour, 1));
    const hrs = Math.max(1, int(newHours, 1));
    const newAmount = hrs * rate;
    const delta = newAmount - int(cur.amountCredits, 0);

    if (delta > 0) {
      const bal = getBalanceById ? getBalanceById(cur.buyerId) : 0;
      if (bal < delta) return { ok: false, need: delta };
      typeof spendCredits === "function" && spendCredits(delta);
    } else if (delta < 0) {
      typeof addCredits === "function" && addCredits(-delta);
    }

    setEscrows((arr) =>
      arr.map((x) =>
        x.id === id ? { ...x, hours: hrs, amountCredits: newAmount } : x
      )
    );

    return { ok: true };
  }

  /* ---------- Reviews & Ratings ---------- */

  // Only buyer can review; only after release; only once
  function addReview(escrowId, { rating, text, reviewerId }) {
    setEscrows((arr) =>
      arr.map((e) => {
        if (e.id !== escrowId) return e;
        if (e.status !== "released") return e;
        if (e.buyerId !== reviewerId) return e;
        if (e.review) return e; // already reviewed
        return {
          ...e,
          review: {
            rating: Math.max(1, Math.min(5, int(rating, 5))),
            text: (text || "").trim(),
            reviewerId,
            createdAt: Date.now(),
          },
        };
      })
    );

    // recompute aggregated rating for the related offer
    setOffers((ofs) => {
      const curEscrow = escrows.find((x) => x.id === escrowId);
      if (!curEscrow) return ofs;
      const offerId = curEscrow.offerId;

      const reviews = escrows
        .filter(
          (x) => x.offerId === offerId && x.status === "released" && x.review
        )
        .map((x) => x.review?.rating);

      // include the one we just added (since escrows state update async)
      const finalRatings = [
        ...reviews,
        Math.max(1, Math.min(5, int(rating, 5))),
      ];

      const count = finalRatings.length;
      const avg = count
        ? Number((finalRatings.reduce((a, b) => a + b, 0) / count).toFixed(2))
        : 0;

      return ofs.map((o) =>
        o.id === offerId ? { ...o, ratingCount: count, ratingAvg: avg } : o
      );
    });
  }

  /* ---------- Helpers / selectors ---------- */

  function sumPendingForBuyer(userId) {
    return escrows
      .filter(
        (e) =>
          e.buyerId === userId &&
          e.status !== "released" &&
          e.status !== "cancelled"
      )
      .reduce((s, e) => s + int(e.amountCredits, 0), 0);
  }

  const value = useMemo(
    () => ({
      offers,
      publishOffer,
      updateOffer,
      escrows,
      createEscrow,
      addMessage,
      markChatRead,
      acceptEscrow,
      cancelEscrow,
      completeEscrow,
      amendEscrow,
      addReview,
      sumPendingForBuyer, // for wallet banner
      toggleFavorite,
      isFavorite,
      getFavorites,
      getReviewsForOffer,
    }),
    [offers, escrows, favorites]
  );

  return <AppState.Provider value={value}>{children}</AppState.Provider>;
}

export const useApp = () => useContext(AppState);
