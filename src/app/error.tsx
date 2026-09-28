"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="not-found">
      <h1>We couldn’t open this page.</h1>
      <p>Your saved data is still on this Mac. Try loading the page again.</p>
      <button className="as-btn as-btn--primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
