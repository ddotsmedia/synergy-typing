// Subtle background motif inspired by the logo's endless-knot diamond.
// Used as a faint decorative layer behind the hero.

export function KnotPattern({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="knot-grid"
          width="48"
          height="48"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect x="0" y="0" width="48" height="48" fill="none" />
          <rect x="20" y="20" width="8" height="8" fill="currentColor" opacity="0.18" />
          <circle cx="0" cy="24" r="1.2" fill="currentColor" opacity="0.25" />
          <circle cx="48" cy="24" r="1.2" fill="currentColor" opacity="0.25" />
          <circle cx="24" cy="0" r="1.2" fill="currentColor" opacity="0.25" />
          <circle cx="24" cy="48" r="1.2" fill="currentColor" opacity="0.25" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#knot-grid)" />
    </svg>
  );
}
