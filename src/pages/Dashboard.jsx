// src/pages/Dashboard.jsx
import { Link, Navigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useApp } from "../context/AppState.jsx";
import OfferForm from "../components/OfferForm.jsx";
import BookingCard from "../components/BookingCard.jsx";
import AccountSwitcher from "../components/AccountSwitcher.jsx";
import WalletCard from "../components/WalletCard.jsx";
import SavedServicesPanel from "../components/SavedServicesPanel.jsx";

export default function Dashboard() {
  const {
    user,
    addCredits,
    spendCredits,
    creditById,
    getBalanceById,
    getNameById,
  } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  const {
    offers,
    escrows,
    acceptEscrow,
    cancelEscrow,
    completeEscrow,
    addMessage,
    markChatRead,
    amendEscrow,
    updateOffer,
    addReview,
    sumPendingForBuyer,
    createEscrow,
  } = useApp();

  const [editingOfferId, setEditingOfferId] = useState(null);

  const myOffers = offers.filter((o) => o.userId === user.id);
  const asBuyer = escrows.filter((e) => e.buyerId === user.id);
  const asProvider = escrows.filter((e) => e.providerId === user.id);
  const offerById = (id) => offers.find((o) => o.id === id);

  // Split active/history
  const isPast = (e) => e.status === "released" || e.status === "cancelled";
  const asBuyerActive = asBuyer.filter((e) => !isPast(e));
  const asBuyerHistory = asBuyer.filter(isPast);
  const asProviderActive = asProvider.filter((e) => !isPast(e));
  const asProviderHistory = asProvider.filter(isPast);

  // Highlight new provider requests (not yet accepted by provider)
  const incomingRequests = asProviderActive.filter((e) => !e.acceptProvider);

  const pendingEscrow = sumPendingForBuyer(user.id);

  function resetDemo() {
    if (!window.confirm("Reset all local demo data and reload?")) return;
    [
      "skillshare_app_v5",
      "__skillshare_seeded_v5",
      "skillshare_auth_v1",
      // Clear old ones if they existed
      "skillshare_app_v4",
      "__skillshare_seeded_v4",
      "skillshare_app_v3",
      "__skillshare_seeded_v3",
    ].forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top bar: account switch + reset */}
      <div className="flex items-center justify-between">
        <AccountSwitcher />
        <button
          onClick={resetDemo}
          className="rounded-lg px-3 py-2 text-sm bg-white ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:ring-slate-700 dark:hover:bg-slate-800"
        >
          Reset demo data
        </button>
      </div>

      {/* Row: Wallet + Publish */}
      <section className="grid gap-6 md:grid-cols-3">
        {/* Wallet (new, “Top up” first) */}
        <WalletCard
          available={user.credits ?? 0}
          pending={pendingEscrow}
          onTopUp={() => addCredits(10)} // £100 -> 10 credits (demo)
          onSimulate={() => addCredits(3)} // demo helper
        />

        {/* Publish offer */}
        <div className="md:col-span-2">
          <OfferForm />
        </div>
      </section>

      {/* Your offers */}
      <section>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your offers</h3>
          <Link
            to="/offers"
            className="text-sm text-indigo-600 hover:underline"
          >
            Browse all offers →
          </Link>
        </div>

        {myOffers.length === 0 ? (
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            No offers yet — publish your first one above.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myOffers.map((o) => (
              <li
                key={o.id}
                className="rounded-2xl border border-slate-200 p-4 bg-white dark:bg-slate-900 dark:border-slate-800"
              >
                {editingOfferId === o.id ? (
                  <OfferEditor
                    offer={o}
                    onCancel={() => setEditingOfferId(null)}
                    onSave={(patch) => {
                      updateOffer(o.id, patch);
                      setEditingOfferId(null);
                    }}
                  />
                ) : (
                  <>
                    <div className="font-medium">{o.title}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      {o.desc}
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="mr-2">
                        {o.creditsPerHour} credits/hr
                      </span>
                      · £{o.gbpPerHour}/hr
                      {typeof o.ratingAvg === "number" && o.ratingCount > 0 && (
                        <span className="ml-2 text-xs text-slate-500">
                          ★ {o.ratingAvg} ({o.ratingCount})
                        </span>
                      )}
                    </div>
                    <div className="mt-3">
                      <button
                        className="rounded-lg px-3 py-2 bg-white ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:ring-slate-700 dark:hover:bg-slate-800"
                        onClick={() => setEditingOfferId(o.id)}
                      >
                        Edit
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Saved services (favorites) with in-place rebooking */}
      <SavedServicesPanel />

      {/* Bookings – two clean columns */}
      <section>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left: You booked */}
          <div className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">You booked</h3>
              <span className="text-xs rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-600 dark:text-slate-300">
                {asBuyerActive.length} active
              </span>
            </div>

            {asBuyerActive.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                No active bookings.
              </p>
            ) : (
              <ul className="mt-3 grid gap-3">
                {asBuyerActive.map((e) => (
                  <BookingCard
                    key={e.id}
                    role="buyer"
                    partnerName={getNameById(e.providerId)}
                    escrow={e}
                    offer={offerById(e.offerId)}
                    onAccept={() => {}}
                    onReject={(reason) =>
                      cancelEscrow(e.id, {
                        reason,
                        currentUserId: user.id,
                        addCredits,
                        creditOther: creditById,
                      })
                    }
                    onCancel={(reason) =>
                      cancelEscrow(e.id, {
                        reason,
                        currentUserId: user.id,
                        addCredits,
                        creditOther: creditById,
                      })
                    }
                    onMarkComplete={() =>
                      completeEscrow(e.id, "buyer", {
                        currentUserId: user.id,
                        addCredits,
                        creditOther: creditById,
                      })
                    }
                    onChatOpened={() => markChatRead(e.id, user.id)}
                    onSendMessage={(text) =>
                      addMessage(e.id, {
                        senderId: user.id,
                        senderName: user.name || user.id,
                        text,
                      })
                    }
                    onEditHours={(newHours) =>
                      amendEscrow(e.id, newHours, {
                        getBalanceById,
                        currentUserId: user.id,
                        addCredits,
                        spendCredits,
                      })
                    }
                    onLeaveReview={(rating, text) =>
                      addReview(e.id, { rating, text, reviewerId: user.id })
                    }
                  />
                ))}
              </ul>
            )}

            {/* Buyer history */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-slate-600 dark:text-slate-300">
                History ({asBuyerHistory.length})
              </summary>
              {asBuyerHistory.length > 0 && (
                <ul className="grid gap-3 mt-3">
                  {asBuyerHistory
                    .slice()
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .map((e) => (
                      <BookingCard
                        key={e.id}
                        role="buyer"
                        partnerName={getNameById(e.providerId)}
                        escrow={e}
                        offer={offerById(e.offerId)}
                        onChatOpened={() => markChatRead(e.id, user.id)}
                        onSendMessage={(text) =>
                          addMessage(e.id, {
                            senderId: user.id,
                            senderName: user.name || user.id,
                            text,
                          })
                        }
                        onLeaveReview={(rating, text) =>
                          addReview(e.id, { rating, text, reviewerId: user.id })
                        }
                        /* one-click rebook from history */
                        onRebook={({ offer, hours }) => {
                          const rate = Number(offer?.creditsPerHour) || 1;
                          const hrs = Math.max(1, Number(hours) || 1);
                          const needed = rate * hrs;
                          const have = Number(user?.credits ?? 0);
                          if (have < needed) {
                            alert(
                              `You need ${needed} credits to rebook (you have ${have}). Top up or earn credits first.`
                            );
                            return;
                          }
                          spendCredits(needed);
                          createEscrow({ offer, buyerId: user.id, hours: hrs });
                          alert("Rebooked! Find it in your active bookings.");
                        }}
                      />
                    ))}
                </ul>
              )}
            </details>
          </div>

          {/* Right: You are the provider */}
          <div className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">For you (provider)</h3>
              <div className="flex items-center gap-2">
                {incomingRequests.length > 0 && (
                  <span className="text-xs rounded-full bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200 px-2 py-0.5">
                    {incomingRequests.length} new request
                    {incomingRequests.length !== 1 ? "s" : ""}
                  </span>
                )}
                <span className="text-xs rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-600 dark:text-slate-300">
                  {asProviderActive.length} active
                </span>
              </div>
            </div>

            {asProviderActive.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                No active bookings for you yet.
              </p>
            ) : (
              <ul className="mt-3 grid gap-3">
                {/* Show incoming first */}
                {incomingRequests.map((e) => (
                  <BookingCard
                    key={e.id}
                    role="provider"
                    partnerName={getNameById(e.buyerId)}
                    escrow={e}
                    offer={offerById(e.offerId)}
                    onAccept={() => acceptEscrow(e.id, "provider")}
                    onReject={(reason) =>
                      cancelEscrow(e.id, {
                        reason,
                        currentUserId: user.id,
                        addCredits,
                        creditOther: creditById,
                      })
                    }
                    onCancel={(reason) =>
                      cancelEscrow(e.id, {
                        reason,
                        currentUserId: user.id,
                        addCredits,
                        creditOther: creditById,
                      })
                    }
                    onMarkComplete={() =>
                      completeEscrow(e.id, "provider", {
                        currentUserId: user.id,
                        addCredits,
                        creditOther: creditById,
                      })
                    }
                    onChatOpened={() => markChatRead(e.id, user.id)}
                    onSendMessage={(text) =>
                      addMessage(e.id, {
                        senderId: user.id,
                        senderName: user.name || user.id,
                        text,
                      })
                    }
                  />
                ))}
                {/* Then the rest */}
                {asProviderActive
                  .filter((e) => e.acceptProvider)
                  .map((e) => (
                    <BookingCard
                      key={e.id}
                      role="provider"
                      partnerName={getNameById(e.buyerId)}
                      escrow={e}
                      offer={offerById(e.offerId)}
                      onAccept={() => acceptEscrow(e.id, "provider")}
                      onReject={(reason) =>
                        cancelEscrow(e.id, {
                          reason,
                          currentUserId: user.id,
                          addCredits,
                          creditOther: creditById,
                        })
                      }
                      onCancel={(reason) =>
                        cancelEscrow(e.id, {
                          reason,
                          currentUserId: user.id,
                          addCredits,
                          creditOther: creditById,
                        })
                      }
                      onMarkComplete={() =>
                        completeEscrow(e.id, "provider", {
                          currentUserId: user.id,
                          addCredits,
                          creditOther: creditById,
                        })
                      }
                      onChatOpened={() => markChatRead(e.id, user.id)}
                      onSendMessage={(text) =>
                        addMessage(e.id, {
                          senderId: user.id,
                          senderName: user.name || user.id,
                          text,
                        })
                      }
                    />
                  ))}
              </ul>
            )}

            {/* Provider history */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-slate-600 dark:text-slate-300">
                History ({asProviderHistory.length})
              </summary>
              {asProviderHistory.length > 0 && (
                <ul className="grid gap-3 mt-3">
                  {asProviderHistory
                    .slice()
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .map((e) => (
                      <BookingCard
                        key={e.id}
                        role="provider"
                        partnerName={getNameById(e.buyerId)}
                        escrow={e}
                        offer={offerById(e.offerId)}
                        onChatOpened={() => markChatRead(e.id, user.id)}
                        onSendMessage={(text) =>
                          addMessage(e.id, {
                            senderId: user.id,
                            senderName: user.name || user.id,
                            text,
                          })
                        }
                      />
                    ))}
                </ul>
              )}
            </details>
          </div>
        </div>
      </section>
    </main>
  );
}

/* Providers can edit title/desc/£hr (credits/hr read-only) */
function OfferEditor({ offer, onSave, onCancel }) {
  const [title, setTitle] = useState(offer.title);
  const [desc, setDesc] = useState(offer.desc);
  const [gbp, setGbp] = useState(offer.gbpPerHour);

  // live preview of credits/hr (keeps platform rule visible)
  const GBP_PER_CREDIT = 10;
  const creditsPreview = Math.max(
    1,
    Math.min(10, Math.round((Number(gbp) || 0) / GBP_PER_CREDIT))
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          title,
          desc,
          gbpPerHour: Number(gbp) || 0, // credits/hr recalculated in updateOffer
        });
      }}
    >
      <label className="block text-sm mb-1">Title</label>
      <input
        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 mb-2"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <label className="block text-sm mb-1">Description</label>
      <textarea
        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 mb-2"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-sm mb-1">£ per hour</label>
          <input
            type="number"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
            value={gbp}
            onChange={(e) => setGbp(e.target.value)}
          />
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-300 mb-2">
          <div className="font-medium">{creditsPreview} credits/hr</div>
          <div className="text-xs text-slate-500">(auto · set by platform)</div>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button className="rounded-lg px-3 py-2 bg-slate-900 text-white hover:opacity-90">
          Save
        </button>
        <button
          type="button"
          className="rounded-lg px-3 py-2 bg-white ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:ring-slate-700 dark:hover:bg-slate-800"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
