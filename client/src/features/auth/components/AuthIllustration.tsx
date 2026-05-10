export function AuthIllustration() {
  return (
    <svg
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      className="h-full w-full"
    >
      <defs>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgb(245 188 73)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="rgb(245 188 73)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="470" cy="120" r="110" fill="url(#sunGlow)" />
      <circle cx="470" cy="120" r="42" fill="rgb(245 188 73)" />
      <circle cx="470" cy="120" r="32" fill="rgb(255 213 122)" />

      <g fill="white" opacity="0.95">
        <ellipse cx="120" cy="160" rx="56" ry="20" />
        <ellipse cx="160" cy="150" rx="38" ry="16" />
        <ellipse cx="90" cy="150" rx="28" ry="12" />
      </g>
      <g fill="white" opacity="0.85">
        <ellipse cx="380" cy="240" rx="46" ry="18" />
        <ellipse cx="350" cy="236" rx="30" ry="14" />
      </g>

      <path
        d="M 60 470 Q 200 360, 330 410 T 540 290"
        stroke="rgb(52 168 158)"
        strokeWidth="3.5"
        strokeDasharray="2 9"
        strokeLinecap="round"
        fill="none"
      />

      <g transform="translate(60 470)">
        <circle r="9" fill="rgb(52 168 158)" />
        <circle r="4" fill="white" />
      </g>

      <g transform="translate(540 290)">
        <path
          d="M 0 6 C -10 -16 -22 -22 -22 -42 C -22 -54 -12 -64 0 -64 C 12 -64 22 -54 22 -42 C 22 -22 10 -16 0 6 Z"
          fill="rgb(244 93 68)"
        />
        <circle cx="0" cy="-42" r="7" fill="white" />
      </g>

      <g transform="translate(330 380) rotate(-22)">
        <path d="M 0 0 L 78 -22 L 36 0 L 78 22 Z" fill="rgb(244 93 68)" />
        <path
          d="M 36 0 L 78 -22 L 78 22 Z"
          fill="rgb(219 76 76)"
        />
        <path
          d="M 36 0 L 0 0"
          stroke="rgb(31 31 46 / 0.18)"
          strokeWidth="1.5"
          strokeDasharray="2 4"
        />
      </g>

      <path
        d="M 0 600 L 0 520 Q 130 450, 280 495 T 600 470 L 600 600 Z"
        fill="rgb(126 196 100)"
        opacity="0.22"
      />
      <path
        d="M 0 600 L 0 555 Q 160 495, 320 520 T 600 510 L 600 600 Z"
        fill="rgb(126 196 100)"
        opacity="0.32"
      />

      <g transform="translate(420 510)" fill="rgb(31 31 46 / 0.5)">
        <rect x="0" y="0" width="3" height="40" />
        <path d="M 3 0 L 30 8 L 3 16 Z" fill="rgb(244 93 68)" />
      </g>
    </svg>
  );
}
