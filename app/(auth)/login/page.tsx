"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

// Crebrid brand coral palette
// #EB7146 — primary coral
// #F4A079 — light coral (glow / light accent)
// #D4633A — dark coral (depth)
// #C85A2E — deep coral (press state)

/* ─── Particle Network Canvas ──────────────────────────────────────────────── */
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const N = 60;
    type P = { x: number; y: number; vx: number; vy: number; r: number };
    const pts: P[] = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.1 + 0.4,
    }));

    function tick() {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.hypot(dx, dy);
          if (d < 155) {
            ctx!.beginPath();
            ctx!.moveTo(pts[i].x, pts[i].y);
            ctx!.lineTo(pts[j].x, pts[j].y);
            // coral connecting lines
            ctx!.strokeStyle = `rgba(244,160,121,${(1 - d / 155) * 0.11})`;
            ctx!.lineWidth = 0.6;
            ctx!.stroke();
          }
        }
      }

      for (const p of pts) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        // coral dots
        ctx!.fillStyle = "rgba(235,113,70,0.28)";
        ctx!.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
      }

      raf = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.55 }}
    />
  );
}

/* ─── Geometric Logo Mark ───────────────────────────────────────────────────── */
// Pointy-top regular hexagon: center (20,20), circumradius 16
// Vertices: (20,4), (33.86,12), (33.86,28), (20,36), (6.14,28), (6.14,12)
// Perimeter ≈ 96
const HEX_PTS = "20,4 33.86,12 33.86,28 20,36 6.14,28 6.14,12";
const SPOKES: [number, number, number, number][] = [
  [20, 20, 20, 4],
  [20, 20, 33.86, 12],
  [20, 20, 33.86, 28],
  [20, 20, 20, 36],
  [20, 20, 6.14, 28],
  [20, 20, 6.14, 12],
];

function CrebridMark({
  animate = false,
  size = 48,
  gradId = "cg",
}: {
  animate?: boolean;
  size?: number;
  gradId?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      {/* Outer hexagon — draws in */}
      <polygon
        points={HEX_PTS}
        stroke={`url(#${gradId})`}
        strokeWidth="1.3"
        fill="none"
        strokeDasharray="96"
        style={
          animate
            ? {
                strokeDashoffset: 96,
                animation: "loginDrawHex 1s cubic-bezier(0.4,0,0.2,1) 0.3s forwards",
              }
            : { strokeDashoffset: 0 }
        }
      />

      {/* Spokes — fade in after hex */}
      {SPOKES.map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={`url(#${gradId})`}
          strokeWidth="0.5"
          style={
            animate
              ? {
                  opacity: 0,
                  animation: `loginFadeInSpoke 0.35s ease ${0.95 + i * 0.04}s forwards`,
                }
              : { opacity: 0.38 }
          }
        />
      ))}

      {/* Center dot */}
      <circle
        cx="20"
        cy="20"
        r="2.2"
        fill={`url(#${gradId})`}
        style={
          animate
            ? { opacity: 0, animation: "loginFadeInDot 0.5s ease 1.25s forwards" }
            : { opacity: 1 }
        }
      />

      <defs>
        <linearGradient
          id={gradId}
          x1="6"
          y1="4"
          x2="34"
          y2="36"
          gradientUnits="userSpaceOnUse"
        >
          {/* coral → dark coral */}
          <stop offset="0%" stopColor="#F4A079" />
          <stop offset="100%" stopColor="#D4633A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Login Page ────────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [introVisible, setIntroVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIntroVisible(false), 1900);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Warm dark charcoal background instead of cold navy
    <div className="relative min-h-screen bg-[#0f0d0c] flex items-center justify-center overflow-hidden">
      {/* Ambient gradient blobs — warm coral tones */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute rounded-full"
          style={{
            top: "-15%",
            left: "-8%",
            width: 560,
            height: 560,
            background: "radial-gradient(circle, rgba(212,99,58,0.14) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: "-18%",
            right: "-6%",
            width: 480,
            height: 480,
            background: "radial-gradient(circle, rgba(180,70,30,0.12) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            height: 300,
            background: "radial-gradient(ellipse, rgba(235,113,70,0.04) 0%, transparent 70%)",
            filter: "blur(30px)",
          }}
        />
      </div>

      {/* Particle canvas */}
      <ParticleCanvas />

      {/* ── Intro overlay ──────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center"
        style={{
          background: "#0f0d0c",
          opacity: introVisible ? 1 : 0,
          pointerEvents: introVisible ? "auto" : "none",
          transition: "opacity 0.75s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div
          style={{
            animation: "loginScaleIn 0.75s cubic-bezier(0.34,1.4,0.64,1) 0.1s both",
          }}
        >
          <CrebridMark animate size={72} gradId="intro-grad" />
        </div>

        <div
          className="mt-5 text-white font-semibold tracking-[0.28em] text-sm uppercase"
          style={{
            opacity: 0,
            animation: "loginFadeInUp 0.5s ease 0.85s forwards",
          }}
        >
          Crebrid
        </div>

        <div
          className="mt-1 tracking-widest text-xs uppercase"
          style={{
            // light coral for tagline
            color: "rgba(244,160,121,0.65)",
            opacity: 0,
            animation: "loginFadeInUp 0.5s ease 1.0s forwards",
          }}
        >
          Broker Portal
        </div>

        <div
          style={{
            marginTop: 28,
            height: 1,
            width: 0,
            // coral gradient expanding line
            background:
              "linear-gradient(90deg, transparent, rgba(235,113,70,0.7), transparent)",
            animation: "loginExpandLine 0.55s ease 1.25s forwards",
          }}
        />
      </div>

      {/* ── Main form ──────────────────────────────────────────────────────── */}
      <div
        className="relative z-10 w-full max-w-sm px-5"
        style={{
          opacity: introVisible ? 0 : 1,
          transform: introVisible ? "translateY(18px)" : "translateY(0)",
          transition:
            "opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)",
          transitionDelay: introVisible ? "0ms" : "80ms",
        }}
      >
        {/* Logo lockup */}
        <div className="flex flex-col items-center mb-8">
          <CrebridMark size={42} gradId="form-grad" />
          <h1
            className="mt-3.5 text-white font-semibold text-lg tracking-wide"
            style={{ letterSpacing: "0.06em" }}
          >
            Crebrid
          </h1>
          <p
            className="text-xs tracking-widest uppercase mt-0.5"
            style={{ color: "rgba(244,160,121,0.6)" }}
          >
            Broker Portal
          </p>
        </div>

        {/* Glass card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.028)",
            border: "1px solid rgba(255,255,255,0.075)",
            backdropFilter: "blur(28px) saturate(180%)",
            // coral outer glow instead of blue
            boxShadow:
              "0 0 0 1px rgba(235,113,70,0.06), 0 28px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.055)",
          }}
        >
          {/* Top accent line — coral gradient */}
          <div
            style={{
              height: 1,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(212,99,58,0.4) 40%, rgba(244,160,121,0.55) 50%, rgba(212,99,58,0.4) 60%, transparent 100%)",
            }}
          />

          {/* Card inner glow — coral */}
          <div
            className="absolute inset-x-0 top-0 h-32 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% -20%, rgba(235,113,70,0.06) 0%, transparent 70%)",
            }}
          />

          <div className="px-8 py-8 relative">
            <h2
              className="font-semibold text-lg mb-0.5"
              style={{ color: "rgba(255,255,255,0.92)" }}
            >
              Sign in
            </h2>
            <p
              className="text-sm mb-7"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Access your broker dashboard
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium mb-2 tracking-widest uppercase"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="broker@example.com"
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.045)",
                    border: "1px solid rgba(255,255,255,0.075)",
                    color: "rgba(255,255,255,0.88)",
                    caretColor: "#EB7146",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border =
                      "1px solid rgba(235,113,70,0.55)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(235,113,70,0.09), inset 0 1px 0 rgba(255,255,255,0.04)";
                    e.currentTarget.style.background =
                      "rgba(255,255,255,0.06)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border =
                      "1px solid rgba(255,255,255,0.075)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background =
                      "rgba(255,255,255,0.045)";
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-medium mb-2 tracking-widest uppercase"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-11 rounded-xl text-sm focus:outline-none transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.045)",
                      border: "1px solid rgba(255,255,255,0.075)",
                      color: "rgba(255,255,255,0.88)",
                      caretColor: "#EB7146",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border =
                        "1px solid rgba(235,113,70,0.55)";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(235,113,70,0.09), inset 0 1px 0 rgba(255,255,255,0.04)";
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.06)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border =
                        "1px solid rgba(255,255,255,0.075)";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.045)";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150"
                    style={{ color: "rgba(255,255,255,0.28)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "rgba(255,255,255,0.28)";
                    }}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div
                  className="px-4 py-3 rounded-xl text-sm"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.22)",
                    color: "rgba(252,165,165,0.9)",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Submit button — coral gradient */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-3 px-4 rounded-xl text-sm font-semibold text-white overflow-hidden flex items-center justify-center gap-2 transition-all duration-200 disabled:cursor-not-allowed"
                  style={{
                    background:
                      "linear-gradient(135deg, #EB7146 0%, #C85A2E 100%)",
                    boxShadow:
                      "0 4px 22px rgba(235,113,70,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
                    opacity: loading ? 0.65 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (loading) return;
                    e.currentTarget.style.boxShadow =
                      "0 6px 30px rgba(235,113,70,0.5), inset 0 1px 0 rgba(255,255,255,0.18)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 4px 22px rgba(235,113,70,0.35), inset 0 1px 0 rgba(255,255,255,0.18)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                  onMouseDown={(e) => {
                    if (loading) return;
                    e.currentTarget.style.transform = "translateY(0.5px)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 14px rgba(235,113,70,0.3), inset 0 1px 0 rgba(255,255,255,0.1)";
                  }}
                  onMouseUp={(e) => {
                    if (loading) return;
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 30px rgba(235,113,70,0.5), inset 0 1px 0 rgba(255,255,255,0.18)";
                  }}
                >
                  {/* Shimmer overlay */}
                  <span
                    className="absolute inset-0 pointer-events-none rounded-xl"
                    style={{
                      background:
                        "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)",
                      backgroundSize: "200% 100%",
                      animation: loading
                        ? "none"
                        : "loginShimmer 2.8s ease-in-out infinite",
                    }}
                  />
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </div>
            </form>

            <p
              className="mt-6 text-center text-xs"
              style={{ color: "rgba(255,255,255,0.22)" }}
            >
              Need access?{" "}
              <a
                href="mailto:support@crebrid.com"
                className="transition-colors duration-150"
                style={{ color: "rgba(244,160,121,0.75)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "rgba(244,160,121,1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(244,160,121,0.75)";
                }}
              >
                Contact Crebrid
              </a>
            </p>
          </div>
        </div>

        <p
          className="mt-5 text-center text-xs"
          style={{ color: "rgba(255,255,255,0.17)" }}
        >
          © {new Date().getFullYear()} Crebrid · Dallas, TX
        </p>
      </div>
    </div>
  );
}
