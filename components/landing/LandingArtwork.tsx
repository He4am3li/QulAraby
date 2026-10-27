import React from "react";

/** Original vector artwork, also the permanent fallback on phones and without WebGL. */
export function LandingArtwork({ chapter }: { chapter: number }) {
  return (
    <div className={`qul-art qul-art-${chapter}`} aria-hidden="true">
      <div className="qul-art-orbit" />
      <div className="qul-art-orbit second" />
      {chapter === 0 ? (
        <div className="qul-monogram">
          <span>قُل</span>
          <small>QUL</small>
        </div>
      ) : (
        <svg viewBox="0 0 500 400" fill="none">
          {chapter === 1 && (
            <g transform="translate(250 210) rotate(-10)">
              <path
                d="M-178-108Q-88-142 0-96Q88-142 178-108V118Q88 83 0 129Q-88 83-178 118Z"
                fill="#163e32"
                stroke="#c4a974"
                strokeWidth="3"
              />
              <path
                d="M-165-120Q-82-142-5-100V111Q-82 69-165 103Z"
                fill="#eee8d4"
              />
              <path
                d="M165-120Q82-142 5-100V111Q82 69 165 103Z"
                fill="#fff9e9"
              />
              {[-55, -25, 5, 35, 65].map((y) => (
                <g key={y} opacity=".35" stroke="#557164" strokeWidth="3">
                  <path d={`M-142 ${y}Q-78 ${y - 15} -27 ${y + 4}`} />
                  <path d={`M142 ${y}Q78 ${y - 15} 27 ${y + 4}`} />
                </g>
              ))}
              <path d="M0-96V127" stroke="#c4a974" strokeWidth="4" />
              <path d="M104-124V-48L90-62 76-52V-129" fill="#c4a974" />
            </g>
          )}
          {chapter === 2 && (
            <g transform="translate(250 205) rotate(-12)">
              <rect
                x="-183"
                y="-114"
                width="366"
                height="229"
                rx="25"
                fill="#173c33"
                stroke="#c4a974"
                strokeWidth="3"
              />
              <rect
                x="-158"
                y="-90"
                width="316"
                height="137"
                rx="12"
                fill="#e8dcc0"
              />
              <path
                d="M-145-69H145M-145-58H145"
                stroke="#b68c52"
                strokeWidth="4"
              />
              <rect
                x="-126"
                y="-31"
                width="252"
                height="64"
                rx="32"
                fill="#18382e"
              />
              {[-83, 83].map((x) => (
                <g
                  key={x}
                  className="qul-reel"
                  style={{ transformOrigin: `${x}px 1px` }}
                >
                  <circle cx={x} cy="1" r="25" fill="#e6dbc4" />
                  <circle cx={x} cy="1" r="11" fill="#173c33" />
                  {[0, 60, 120].map((a) => (
                    <path
                      key={a}
                      d={`M${x - 25} 1H${x + 25}`}
                      stroke="#173c33"
                      strokeWidth="5"
                      transform={`rotate(${a} ${x} 1)`}
                    />
                  ))}
                </g>
              ))}
              <path
                d="M-106 70H106L125 105H-125Z"
                stroke="#c4a974"
                strokeWidth="2"
              />
              {[-164, 164].flatMap((x) =>
                [-95, 96].map((y) => (
                  <circle
                    key={`${x}-${y}`}
                    cx={x}
                    cy={y}
                    r="3"
                    fill="#c4a974"
                  />
                )),
              )}
            </g>
          )}
          {chapter === 3 && (
            <>
              <circle cx="345" cy="121" r="73" fill="#a4895a" />
              <ellipse
                cx="345"
                cy="121"
                rx="113"
                ry="24"
                transform="rotate(-25 345 121)"
                stroke="#e7c78b"
                strokeWidth="6"
              />
              <g transform="translate(195 237) rotate(35)">
                <path d="M-23 64L0 144 23 64" fill="#69dab7" opacity=".7" />
                <path d="M-11 65L0 118 11 65" fill="#fff9e9" />
                <path
                  d="M-25 10L-60 65-24 54M25 10L60 65 24 54"
                  fill="#b3935f"
                />
                <path d="M0-101Q-47-53-25 64H25Q47-53 0-101Z" fill="#e9e4d6" />
                <path d="M0-101Q-19-80-25-59H25Q19-80 0-101" fill="#ac8853" />
                <circle
                  cy="-23"
                  r="19"
                  fill="#0e3b31"
                  stroke="#c5a46c"
                  strokeWidth="6"
                />
              </g>
              {[
                [80, 80],
                [420, 290],
                [280, 320],
                [112, 156],
              ].map(([x, y]) => (
                <path
                  key={x}
                  d={`M${x - 5} ${y}H${x + 5}M${x} ${y - 5}V${y + 5}`}
                  stroke="#d7c392"
                />
              ))}
            </>
          )}
        </svg>
      )}
      <div className="qul-art-floor" />
    </div>
  );
}
