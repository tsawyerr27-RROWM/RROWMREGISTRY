/** Cubist portrait — angular planes, displaced features, Picasso register. */
export function LandingMinimalPortraitFigure() {
  return (
    <svg
      viewBox="0 0 300 380"
      xmlns="http://www.w3.org/2000/svg"
      className="landing-minimal-portrait__svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <rect width="300" height="380" fill="#e4dbd0" />

      {/* shoulders — split planes */}
      <polygon points="28,340 118,288 108,380 18,380" fill="#141210" />
      <polygon points="188,296 282,338 282,380 148,380" fill="#1e1a16" />
      <polygon points="108,320 148,308 142,380 108,380" fill="#2c2620" />

      {/* neck */}
      <polygon points="122,258 162,252 158,312 118,318" fill="#d9b896" />
      <polygon points="162,252 186,262 178,316 158,312" fill="#b88862" />

      {/* hair — sharp wedges */}
      <polygon
        points="78,210 88,108 158,88 228,108 238,188 210,162 168,118 112,138"
        fill="#12100e"
      />
      <polygon points="88,108 118,98 148,112 112,138" fill="#1c1814" />

      {/* face planes */}
      <polygon points="88,168 198,138 192,198 98,212" fill="#edd0b0" />
      <polygon points="198,138 232,168 218,268 192,198" fill="#c49268" />
      <polygon points="98,212 192,198 188,278 96,262" fill="#e0bc94" />
      <polygon points="96,262 188,278 172,298 104,292" fill="#d4a87a" />

      {/* Picasso shadow plane — cool grey-violet */}
      <polygon points="138,198 178,188 170,242 128,248" fill="#6e7f96" opacity="0.52" />

      {/* ember accent plane */}
      <polygon points="200,168 228,188 214,228 188,212" fill="#c45a28" opacity="0.72" />

      {/* ear — angular */}
      <path
        d="M76 198 L68 218 L74 242 L86 228 L82 204 Z"
        fill="#c9a078"
        stroke="#141210"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* nose — profile hook */}
      <polygon
        points="152,192 188,208 168,248 142,232"
        fill="#a87050"
        stroke="#141210"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* left eye — almond, higher */}
      <ellipse
        cx="118"
        cy="178"
        rx="14"
        ry="7"
        fill="#141210"
        transform="rotate(-18 118 178)"
      />
      <ellipse
        cx="118"
        cy="178"
        rx="5"
        ry="3"
        fill="#f0e8dc"
        transform="rotate(-18 118 178)"
      />

      {/* right eye — larger, lower, different axis */}
      <ellipse
        cx="192"
        cy="202"
        rx="18"
        ry="9"
        fill="#141210"
        transform="rotate(12 192 202)"
      />
      <ellipse
        cx="196"
        cy="200"
        rx="6"
        ry="4"
        fill="#f0e8dc"
        transform="rotate(12 196 200)"
      />

      {/* mouth — offset, angular */}
      <path
        d="M128 268 L158 276 L172 262"
        stroke="#6e4038"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M132 274 L166 268"
        stroke="#8a5048"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* cubist outline accents */}
      <path
        d="M88 168 L198 138 L232 168 M98 212 L192 198 M96 262 L188 278"
        stroke="#141210"
        strokeWidth="1.25"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />
    </svg>
  );
}
