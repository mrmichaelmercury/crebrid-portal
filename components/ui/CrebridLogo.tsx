export function CrebridLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className}>
      <rect x="5" y="5" width="14" height="14" rx="1.5"
        transform="rotate(45 12 12)" fill="#E06835" />
      <rect x="17" y="17" width="12" height="12" rx="1.5"
        transform="rotate(45 23 23)" fill="#D1D5DB" stroke="white" strokeWidth="1.5" />
    </svg>
  );
}
