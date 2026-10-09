/**
 * A repository's GitHub social card.
 *
 * github.com generates these per repository at opengraph.githubassets.com and
 * they carry the real name, description, star count and language. That makes
 * them the only genuine images available for 56 projects I do not own: I have
 * no screenshots of other people's code and inventing a graphic for each one
 * would be decoration pretending to be a record.
 *
 * Lazy and async, because 56 of these on the index would be 3MB of PNG that
 * nobody has scrolled to yet. The aspect ratio is fixed so the row does not
 * jump when the image lands.
 */
export default function RepoCard({ full, priority = false }: { full: string; priority?: boolean }) {
  return (
    <span className="block overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--bg-raised)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://opengraph.githubassets.com/1/${full}`}
        alt={`${full} on GitHub`}
        width={1200}
        height={600}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="block aspect-[2/1] w-full object-cover"
      />
    </span>
  );
}
