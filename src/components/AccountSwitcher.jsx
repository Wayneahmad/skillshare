// src/components/AccountSwitcher.jsx
import { useAuth } from "../context/AuthContext.jsx";

export default function AccountSwitcher() {
  const ctx = useAuth(); // be defensive if context shape changes
  const user = ctx?.user || null;
  const signInAs = ctx?.signInAs;

  // Accept allUsers as array or object; otherwise fallback to []
  const listRaw = ctx?.allUsers;
  const list = Array.isArray(listRaw)
    ? listRaw
    : listRaw && typeof listRaw === "object"
    ? Object.values(listRaw)
    : [];

  // Hide if we don't have anything to switch to or no handler
  if (!signInAs || list.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 inline-flex items-center gap-2">
      <span className="text-sm text-slate-600 dark:text-slate-300">
        Viewing as
      </span>
      <select
        className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-sm"
        value={user?.id || ""}
        onChange={(e) => signInAs(e.target.value)}
      >
        {list.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name || u.email || u.id}
          </option>
        ))}
      </select>
    </div>
  );
}
