/**
 * Mira, the guide character.
 *
 * Inline SVG rather than an image file: it stays crisp at any size, weighs
 * nothing, recolours with the theme, and works offline. Three expressions
 * cover the whole onboarding flow - asking, waiting, and celebrating.
 */
export default function Teacher({ mood = "smile", size = 96 }) {
  const eyes =
    mood === "cheer"
      ? // happy arcs
        <>
          <path d="M40 45 q4 -5 8 0" fill="none" stroke="#2F2A24" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M56 45 q4 -5 8 0" fill="none" stroke="#2F2A24" strokeWidth="2.4" strokeLinecap="round" />
        </>
      : mood === "think"
      ? // looking up and to the side
        <>
          <circle cx="45" cy="45" r="2.6" fill="#2F2A24" />
          <circle cx="61" cy="45" r="2.6" fill="#2F2A24" />
          <path d="M39 40 q5 -3 10 -1" fill="none" stroke="#2F2A24" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M55 39 q5 -2 10 1" fill="none" stroke="#2F2A24" strokeWidth="1.8" strokeLinecap="round" />
        </>
      : <>
          <circle cx="44" cy="46" r="3" fill="#2F2A24" />
          <circle cx="62" cy="46" r="3" fill="#2F2A24" />
        </>;

  const mouth =
    mood === "cheer" ? (
      <path d="M45 56 q8 9 16 0 q-8 4 -16 0Z" fill="#B8503A" />
    ) : mood === "think" ? (
      <path d="M48 57 q5 -2 10 0" fill="none" stroke="#B8503A" strokeWidth="2.4" strokeLinecap="round" />
    ) : (
      <path d="M47 55 q6 6 12 0" fill="none" stroke="#B8503A" strokeWidth="2.6" strokeLinecap="round" />
    );

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 106 106"
      role="img"
      aria-hidden="true"
      className="teacher"
    >
      {/* chalkboard disc behind her */}
      <circle cx="53" cy="53" r="50" fill="#EFE7D2" />
      <circle cx="53" cy="53" r="50" fill="none" stroke="#2F4538" strokeWidth="2.5" />

      {/* shoulders and sari */}
      <path d="M22 104 q6 -26 31 -26 q25 0 31 26Z" fill="#2F4538" />
      <path d="M40 80 q13 16 26 0 l6 6 q-19 18 -38 0Z" fill="#E0A339" />
      <path d="M53 84 l4 20 h-8Z" fill="#C1543C" />

      {/* neck */}
      <rect x="47" y="66" width="12" height="12" rx="5" fill="#E8B48C" />

      {/* face */}
      <ellipse cx="53" cy="48" rx="20" ry="22" fill="#F2C49B" />

      {/* hair: centre parting and a low bun */}
      <path d="M33 45 q1 -24 20 -24 q19 0 20 24 q-4 -13 -20 -13 q-16 0 -20 13Z" fill="#2A2320" />
      <circle cx="53" cy="20" r="7" fill="#2A2320" />
      <path d="M33 45 q-2 12 2 18 q-8 -8 -6 -20Z" fill="#2A2320" />
      <path d="M73 45 q2 12 -2 18 q8 -8 6 -20Z" fill="#2A2320" />

      {/* bindi */}
      <circle cx="53" cy="33" r="2.4" fill="#C1543C" />

      {eyes}
      {mouth}

      {/* pointer, angled toward whatever she is asking about */}
      <g transform="rotate(-18 82 70)">
        <rect x="78" y="52" width="4" height="30" rx="2" fill="#8A6A3A" />
        <circle cx="80" cy="51" r="4" fill="#E0A339" />
      </g>
      <circle cx="80" cy="82" r="7" fill="#F2C49B" />
    </svg>
  );
}
