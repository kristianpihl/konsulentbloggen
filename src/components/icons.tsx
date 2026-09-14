export function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

export function MailIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function ShareIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
      aria-hidden
    >
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.2 10.8 15.8 6.2M8.2 13.2l7.6 4.6" />
    </svg>
  );
}

export function LinkIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
      aria-hidden
    >
      <path d="M9 15 15 9" />
      <path d="M10 6.5 11.5 5a3.5 3.5 0 0 1 5 5L15 11.5" />
      <path d="M14 17.5 12.5 19a3.5 3.5 0 0 1-5-5L9 12.5" />
    </svg>
  );
}

export function CloseIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
      aria-hidden
    >
      <path d="m5 5 14 14M19 5 5 19" />
    </svg>
  );
}

export function MoreIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <circle cx="5" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="19" cy="12" r="1.7" />
    </svg>
  );
}

export function XLogoIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.3 3H21l-6.6 7.5L22 21h-6.1l-4.8-6-5.5 6H3l7-8L2.5 3h6.3l4.3 5.5L18.3 3Zm-1 16.2h1.6L7.8 4.7H6l11.3 14.5Z" />
    </svg>
  );
}

export function LinkedInIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M4.98 3.5a2.5 2.5 0 1 1-.02 5 2.5 2.5 0 0 1 .02-5ZM3 9.75h4V21H3zM9.5 9.75H13v1.54h.05c.5-.9 1.7-1.85 3.5-1.85 3.75 0 4.45 2.4 4.45 5.5V21h-4v-5.1c0-1.2 0-2.75-1.7-2.75s-1.95 1.3-1.95 2.65V21h-4Z" />
    </svg>
  );
}
