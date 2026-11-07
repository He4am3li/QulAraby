import React from "react";

/**
 * Space Journey presentation shell, deliberately free of emoji, AI badges,
 * decorative illustrations and generic rounded dashboard cards.
 * The cyan light is rendered with CSS alone and uses no extra image assets.
 */
export const SPACE_LASER_GLASS = {
  background:
    "linear-gradient(141deg, rgba(25,110,170,.31) 0%, rgba(6,37,77,.56) 29%, rgba(2,14,44,.70) 60%, rgba(21,108,177,.32) 100%)",
  border: "1px solid rgba(112,221,255,.78)",
  boxShadow:
    "0 0 0 1px rgba(110,221,255,.13), 0 0 36px rgba(21,164,252,.28), 0 0 85px rgba(9,79,214,.15), inset 0 1px 0 rgba(220,248,255,.45), inset 0 0 40px rgba(14,138,255,.12)",
  backdropFilter: "blur(28px) saturate(165%)",
  WebkitBackdropFilter: "blur(28px) saturate(165%)",
} as const;

interface SpaceLaserGlassProps {
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
  variant?: "mission" | "outcome";
}

export const SpaceLaserGlass: React.FC<SpaceLaserGlassProps> = ({
  children,
  className = "",
  variant = "mission",
  "aria-label": ariaLabel,
}) => (
  <section
    data-space-laser-glass={variant}
    aria-label={ariaLabel}
    className={"relative isolate overflow-hidden rounded-[22px] text-[#e4faff] " + className}
    style={SPACE_LASER_GLASS}
    dir="rtl"
  >
    {/* Light is carried by restrained material highlights, not decorative icons. */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
      style={{
        background:
          "linear-gradient(125deg,rgba(174,241,255,.19),transparent 26%,transparent 72%,rgba(55,163,255,.12)),radial-gradient(ellipse 60% 18% at 50% 0%,rgba(104,229,255,.20),transparent 100%)",
      }}
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-[1px] rounded-[21px] opacity-[.19]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(101,209,250,.16) 1px,transparent 1px),linear-gradient(90deg,rgba(101,209,250,.14) 1px,transparent 1px)",
        backgroundSize: "27px 27px",
        maskImage: "linear-gradient(to bottom,rgba(0,0,0,.5),transparent 82%)",
      }}
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-[15%] top-0 h-[2px]"
      style={{ background: "linear-gradient(90deg,transparent,#b5f6ff 30%,#3bc9ff 70%,transparent)", boxShadow: "0 0 13px #43cdff,0 0 31px rgba(24,139,255,.68)" }}
    />
    <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-[18%] right-[18%] h-px bg-gradient-to-r from-transparent via-[#6bddff]/65 to-transparent" />
    <div aria-hidden="true" className="pointer-events-none absolute left-2 top-3 h-8 w-8 border-l border-t border-[#b8f2ff]/80" />
    <div aria-hidden="true" className="pointer-events-none absolute right-2 top-3 h-8 w-8 border-r border-t border-[#b8f2ff]/80" />
    <div aria-hidden="true" className="pointer-events-none absolute bottom-3 left-2 h-8 w-8 border-b border-l border-[#69d8ff]/65" />
    <div aria-hidden="true" className="pointer-events-none absolute bottom-3 right-2 h-8 w-8 border-b border-r border-[#69d8ff]/65" />
    <div className="relative z-10">{children}</div>
  </section>
);

export const SPACE_GLASS_PRIMARY_BUTTON =
  "inline-flex min-h-[46px] items-center justify-center rounded-xl border border-[#8ce9ff]/80 bg-[linear-gradient(125deg,rgba(17,142,213,.62),rgba(26,88,174,.64))] px-5 py-2.5 text-center text-sm font-bold text-[#f1fcff] shadow-[inset_0_1px_0_rgba(240,252,255,.36),0_0_26px_rgba(34,170,250,.21)] backdrop-blur-xl transition-colors hover:bg-[#1284c1]/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d1faff]";

export const SPACE_GLASS_SECONDARY_BUTTON =
  "inline-flex min-h-[46px] items-center justify-center rounded-xl border border-[#69bedd]/45 bg-[rgba(6,25,58,.40)] px-4 py-2.5 text-center text-sm font-semibold text-[#bfedff] backdrop-blur-lg transition-colors hover:border-[#9feaff] hover:bg-[rgba(19,66,116,.58)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d1faff]";
