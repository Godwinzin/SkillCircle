export default function Logo({ size = 28 }) {
  return (
    <svg
      className="logo"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
    >
      <rect className="logo-bg" width="64" height="64" rx="14" />
      <circle className="logo-ring" cx="32" cy="32" r="16" fill="none" strokeWidth="6" />
      <circle className="logo-dot" cx="46" cy="18" r="6" />
    </svg>
  );
}