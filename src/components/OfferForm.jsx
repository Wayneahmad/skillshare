// src/components/OfferForm.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useApp } from "../context/AppState.jsx";
import { CATEGORIES } from "../lib/categories.js";

export default function OfferForm() {
  const { user } = useAuth();
  const { publishOffer } = useApp();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [gbp, setGbp] = useState("");
  const [category, setCategory] = useState("other");

  const GBP_PER_CREDIT = 10;
  const creditsPreview = Math.max(
    1,
    Math.min(10, Math.round((Number(gbp) || 0) / GBP_PER_CREDIT))
  );

  if (!user) return null;

  function submit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    publishOffer({
      userId: user.id,
      userName: user.name || user.id,
      title: title.trim(),
      desc: desc.trim(),
      gbpPerHour: Number(gbp) || 0,
      category,
      // credits/hr derived in AppState; preview is just UI
    });
    setTitle("");
    setDesc("");
    setGbp("");
    setCategory("other");
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-slate-200 p-5 bg-white dark:bg-slate-900 dark:border-slate-800"
    >
      <h2 className="text-lg font-semibold">Publish an offer</h2>
      <p className="mt-1 text-sm text-slate-500">
        Most listings sit around 3–6 credits/hour.
      </p>

      <label className="block mt-4 text-sm">Category</label>
      <select
        className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        {CATEGORIES.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.label}
          </option>
        ))}
      </select>

      <label className="block mt-4 text-sm">Skill title</label>
      <input
        className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
        placeholder="e.g., Portrait photography session"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label className="block mt-4 text-sm">Short description</label>
      <textarea
        className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
        rows={3}
        placeholder="What do clients get?"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm">£ per hour</label>
          <input
            type="number"
            className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
            placeholder="e.g., 40"
            value={gbp}
            onChange={(e) => setGbp(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm">Credits per hour</label>
          <div className="mt-1 h-[42px] grid place-items-center rounded-lg border border-slate-300 dark:border-slate-700">
            <span className="text-sm font-medium">
              {creditsPreview} credits/hr
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            (auto · set by platform)
          </p>
        </div>
      </div>

      <button className="mt-4 w-full rounded-xl px-4 py-2 bg-slate-900 text-white hover:opacity-90">
        Publish offer
      </button>
    </form>
  );
}
