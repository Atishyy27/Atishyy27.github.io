// A page needs a bottom edge. Without one it reads as floating, which is the single
// most common trait of the portfolios that feel settled: they all close with a line
// of real, checkable facts rather than trailing off into whitespace.
//
// Every value here is real. The commit is injected at build time by the deploy
// workflow, and falls back to "dev" locally rather than printing something false.

const COMMIT = process.env.NEXT_PUBLIC_COMMIT ?? "dev";
const BUILT = new Date().toISOString().slice(0, 10);

export default function Colophon() {
  return (
    <footer className="mx-auto w-full max-w-[var(--measure)] px-6 pb-16 pt-20 sm:px-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-t border-[var(--line)] pt-6 text-[length:var(--step-small)] text-[var(--fg-muted)]">
        <span>Built {BUILT}</span>
        <span>
          Next.js, static export, GitHub Pages ·{" "}
          <a
            href="https://github.com/Atishyy27/Atishyy27.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="link"
          >
            source
          </a>
          {COMMIT !== "dev" ? (
            <>
              {" · "}
              <a
                href={`https://github.com/Atishyy27/Atishyy27.github.io/commit/${COMMIT}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link"
              >
                {COMMIT.slice(0, 7)}
              </a>
            </>
          ) : null}
        </span>
      </div>
    </footer>
  );
}
