import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col justify-center px-6 sm:px-8">
      <p className="text-sm text-[var(--fg-muted)]">404</p>
      <h1 className="display mt-4 text-5xl leading-[1.05] sm:text-6xl">
        This page does not exist
      </h1>
      <p className="mt-6 text-lg text-[var(--fg-muted)]">
        The link is wrong, or the page moved. Both are fixable.
      </p>
      <div className="mt-10 flex gap-6">
        <Link href="/" className="link text-sm">Home</Link>
        <Link href="/projects/" className="link text-sm">Projects</Link>
        <Link href="/journal/" className="link text-sm">Journal</Link>
      </div>
    </main>
  );
}
