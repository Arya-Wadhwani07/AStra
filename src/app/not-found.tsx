import Link from "next/link";
export default function NotFound() {
  return (
    <main className="not-found">
      <p className="as-eyebrow">404</p>
      <h1>This world is still uncharted.</h1>
      <p>The page you’re looking for does not exist.</p>
      <Link href="/" className="as-btn as-btn--primary">
        Back to AStra
      </Link>
    </main>
  );
}
