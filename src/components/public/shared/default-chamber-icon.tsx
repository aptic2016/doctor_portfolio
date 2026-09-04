export function DefaultChamberIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Soft background circle */}
      <circle cx="24" cy="24" r="23" className="fill-primary/8 stroke-primary/15" strokeWidth="1" />

      {/* Doctor head */}
      <circle cx="24" cy="16" r="6" className="fill-primary/15 stroke-primary" strokeWidth="1.5" />

      {/* Body / shoulders */}
      <path
        d="M12 38c0-7.5 5.4-13 12-13s12 5.5 12 13"
        className="fill-primary/10 stroke-primary"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Stethoscope tubing */}
      <path
        d="M20 22c0 0 0 6 4 8"
        className="stroke-primary/70"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M28 22c0 0 0 6-4 8"
        className="stroke-primary/70"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Stethoscope chest piece */}
      <circle cx="24" cy="30" r="2" className="fill-primary/25 stroke-primary/80" strokeWidth="1" />

      {/* Medical cross on chest */}
      <path
        d="M22.5 26h3M24 24.5v3"
        className="stroke-primary/60"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  )
}
