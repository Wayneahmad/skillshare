// src/components/ThemeToggle.jsx
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  return (
    <button
      onClick={() => setDark((v) => !v)}
      className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {/* sun / moon icon */}
      {dark ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 8a4 4 0 100 8 4 4 0 000-8z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
