export function CrebridLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className}>
      {/* Dark left-pointing chevron (<) */}
      <polygon points="24,4 14,4 4,18 14,32 24,32 14,18" fill="#1d1d1d" />
      {/* Orange right-pointing chevron (>) — drawn in front, overlapping */}
      <polygon points="12,4 22,4 32,18 22,32 12,32 22,18" fill="#E06835" />
    </svg>
  );
}
