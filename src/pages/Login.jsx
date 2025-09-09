// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = signIn({ email, password });
      if (!res.ok) {
        setErr(res.error || "Could not log in.");
        return;
      }
      navigate("/dashboard", { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Welcome back!
      </p>

      {err && (
        <div className="mt-4 rounded-lg bg-rose-50 text-rose-800 dark:bg-rose-900/20 dark:text-rose-200 px-3 py-2 text-sm">
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button
          className="w-full rounded-xl px-4 py-2 bg-slate-900 text-white hover:opacity-90 disabled:opacity-50"
          disabled={busy}
        >
          Log in
        </button>

        <p className="text-sm text-slate-600 dark:text-slate-300">
          New here?{" "}
          <Link to="/signup" className="text-indigo-600 hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </main>
  );
}
