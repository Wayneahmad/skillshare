// src/pages/Home.jsx
import Hero from "../components/Hero.jsx";

export default function Home() {
  return (
    <>
      <Hero />
      <section
        id="explore"
        className="py-24 border-t border-slate-200 dark:border-slate-800"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Explore
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Coming soon…
          </p>
        </div>
      </section>

      <section
        id="how"
        className="py-24 border-t border-slate-200 dark:border-slate-800"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            How it works
          </h2>
          <ol className="mt-4 space-y-2 text-slate-600 dark:text-slate-300 list-decimal list-inside">
            <li>Publish an offer and earn credits when completed.</li>
            <li>Spend credits on services you need.</li>
            <li>Both sides confirm → credits release from escrow.</li>
          </ol>
        </div>
      </section>

      <section
        id="pricing"
        className="py-24 border-t border-slate-200 dark:border-slate-800"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Pricing
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            MVP: free to use while we build. 💜
          </p>
        </div>
      </section>
    </>
  );
}
