export function CrebridLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className}>
      {/* Left dark chevron — centered vertically in square viewBox */}
      <path d="M0 3 L14 3 L21 18 L14 33 L0 33 L7 18 Z" fill="#2d2d2d" />
      {/* Right orange chevron */}
      <path d="M14 3 L28 3 L36 18 L28 33 L14 33 L21 18 Z" fill="#E06835" />
    </svg>
  );
}
