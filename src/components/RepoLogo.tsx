/**
 * A repository's owner avatar, straight from GitHub.
 *
 * No client component and no error handling needed: github.com/<owner>.png
 * always returns an image for a valid owner, falling back to GitHub's own
 * generated identicon, so there is no broken-image state to handle. That is
 * why this is used for repositories and the company Logo is not: a favicon
 * service returns a generic globe for a domain it does not know, which looks
 * like a mistake, whereas an identicon looks deliberate.
 */
export default function RepoLogo({ owner, size = 28 }: { owner: string; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center overflow-hidden rounded-md border border-[var(--line)] bg-[var(--bg-raised)]"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://github.com/${owner}.png?size=${size * 2}`}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        className="h-full w-full object-cover"
      />
    </span>
  );
}
