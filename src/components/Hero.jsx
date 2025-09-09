// src/components/Hero.jsx
import { Link } from "react-router-dom";
import Button from "./Button.jsx";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white via-indigo-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-2">
          {/* Copy */}
          <div>
            <span className="inline-block rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 text-sm font-medium dark:bg-indigo-900/40 dark:text-indigo-300">
              New • MVP in progress
            </span>

            <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              Trade skills, not cash.
            </h1>

            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Post what you can offer, earn credits, and spend them on what you
              need. Simple, fair, and fast.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3" id="signup">
              <Button as={Link} to="/signup">
                Get started — it's free
              </Button>
              <Button as={Link} to="/login" variant="outline">
                Log in
              </Button>
              {/* New: Browse offers CTA */}
              <Link
                to="/offers"
                className="px-5 py-3 rounded-xl bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 text-center dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800"
              >
                Browse offers
              </Link>
            </div>

            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              No overdrafts or debt. You can only spend what you’ve earned.
            </p>
          </div>

          {/* Visual placeholder (swap for screenshot/illustration later) */}
          <div className="relative">
            <div className="aspect-video rounded-2xl border border-slate-200 bg-white shadow-sm p-4 flex items-center justify-center dark:bg-slate-900 dark:border-slate-800">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 grid place-items-center dark:from-slate-800 dark:to-slate-700">
                <span className="text-slate-500 dark:text-slate-300">
                  (Dashboard preview goes here)
                </span>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden md:block">
              <div className="h-24 w-24 rounded-2xl bg-white shadow ring-1 ring-slate-200 grid place-items-center dark:bg-slate-900 dark:ring-slate-800">
                <span className="text-sm text-slate-600 dark:text-slate-200">
                  ESCROW
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
