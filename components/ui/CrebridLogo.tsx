export function CrebridLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className}>
      {/* Left dark diamond */}
      <polygon points="11,9 20,18 11,27 2,18" fill="#2d2d2d" />
      {/* Right orange diamond, overlapping left */}
      <polygon points="24,9 33,18 24,27 15,18" fill="#E06835" />
    </svg>
  );
}
