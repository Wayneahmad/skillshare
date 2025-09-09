// src/components/Navbar.jsx
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import Button from "./Button.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();

  // Route-based items (get active state)
  const routeItems = [{ label: "Offers", to: "/offers" }];

  // Homepage section anchors – use Link to "/#id" so they work from any page
  const anchorItems = [
    { label: "Explore", to: "/#explore" },
    { label: "How it works", to: "/#how" },
    { label: "Pricing", to: "/#pricing" },
  ];

  const linkBase =
    "transition text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200 dark:bg-slate-900/80 dark:border-slate-800">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <span className="inline-block h-7 w-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500" />
            <span className="text-lg font-semibold tracking-tight text-slate-800 dark:text-slate-100">
              Skillshare
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {routeItems.map((r) => (
              <NavLink
                key={r.label}
                to={r.to}
                className={({ isActive }) =>
                  isActive ? "text-slate-900 dark:text-white" : linkBase
                }
              >
                {r.label}
              </NavLink>
            ))}
            {anchorItems.map((a) => (
              <Link key={a.label} to={a.to} className={linkBase}>
                {a.label}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Profile
                </Link>
                <button
                  onClick={signOut}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:opacity-90"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" variant="ghost">
                  Log in
                </Button>
                <Button as={Link} to="/signup">
                  Sign up
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? (
              // Close icon
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              // Hamburger
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500 dark:text-slate-400 px-2">
                Menu
              </span>
              <ThemeToggle />
            </div>

            <div className="flex flex-col gap-1">
              {/* Route items with active state */}
              {routeItems.map((r) => (
                <NavLink
                  key={r.label}
                  to={r.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    [
                      "px-2 py-2 rounded-lg transition",
                      isActive
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
                    ].join(" ")
                  }
                >
                  {r.label}
                </NavLink>
              ))}

              {/* Anchor items */}
              {anchorItems.map((a) => (
                <Link
                  key={a.label}
                  to={a.to}
                  className="px-2 py-2 rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  onClick={() => setOpen(false)}
                >
                  {a.label}
                </Link>
              ))}

              <div className="mt-2 flex gap-2">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="flex-1 px-3 py-2 rounded-lg text-center text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                      onClick={() => setOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="flex-1 px-3 py-2 rounded-lg text-center text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                      onClick={() => setOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setOpen(false);
                        signOut();
                      }}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-900 text-white text-center hover:opacity-90"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Button
                      as={Link}
                      to="/login"
                      variant="ghost"
                      className="flex-1 text-center"
                      onClick={() => setOpen(false)}
                    >
                      Log in
                    </Button>
                    <Button
                      as={Link}
                      to="/signup"
                      className="flex-1 text-center"
                      onClick={() => setOpen(false)}
                    >
                      Sign up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
