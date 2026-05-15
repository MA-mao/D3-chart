import { useState, useEffect } from "react";

const ebitdaImageUrl = "/logo.webp";

function OrbitRing({ radius, words, duration, clockwise = true }) {
  return (
    <div
      style={{
        position: "absolute",
        width: radius * 2,
        height: radius * 2,
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        animation: `spin${clockwise ? "CW" : "CCW"} ${duration}s linear infinite`,
      }}
    >
      {words.map((word, i) => {
        const angle = (i / words.length) * 360;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `rotate(${angle}deg) translateX(${radius}px) rotate(${clockwise ? -angle : angle}deg)`,
              transformOrigin: "0 0",
              fontSize: 11,
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: 2,
              color: "rgba(255,255,255,0.35)",
              whiteSpace: "nowrap",
            }}
          >
            {word}
          </div>
        );
      })}
    </div>
  );
}

export default function EbitdaIntro({ onFinish }) {
  const [phase, setPhase] = useState("intro");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("exit"), 3800);
    const t2 = setTimeout(() => {
      setPhase("done");
      if (onFinish) onFinish();
    }, 4700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const words1 = ["EARNINGS", "BEFORE", "INTEREST", "TAXES", "DEPRECIATION", "AMORTIZATION"];
  const words2 = ["EBITDA", "MARGIN", "PROFIT", "VALUATION", "CASHFLOW", "GROWTH"];

  if (phase === "done") return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0d14; overflow: hidden; }
        @keyframes spinCW  { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }
        @keyframes spinCCW { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(-360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulseGlow { 0%,100%{box-shadow:0 0 40px rgba(108,99,255,0.5)} 50%{box-shadow:0 0 80px rgba(108,99,255,0.9)} }
        @keyframes imgEntrance {
          0%   { opacity:0; transform:scale(0.6) rotate(-8deg); filter:blur(12px) brightness(2); }
          60%  { opacity:1; transform:scale(1.06) rotate(2deg); filter:blur(0) brightness(1.1); }
          100% { opacity:1; transform:scale(1) rotate(0deg); filter:blur(0) brightness(1); }
        }
        @keyframes titleSlide { from{opacity:0;letter-spacing:0.4em} to{opacity:1;letter-spacing:0.12em} }
        @keyframes subtitleFade { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes introExit { from { opacity:1; transform:scale(1); } to { opacity:0; transform:scale(1.1); } }
        .dot-pulse::after {
          content: '';
          display:inline-block;
          width:6px; height:6px;
          border-radius:50%;
          background:#6C63FF;
          margin-left:8px;
          animation:dotPulse 1s infinite;
        }
        @keyframes dotPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.5)} }
      `}</style>

      <div
        style={{
          ...styles.intro,
          animation: phase === "exit"
            ? "introExit 0.9s cubic-bezier(.7,0,.3,1) forwards"
            : "none",
        }}
      >
        <div style={styles.grid} />
        <OrbitRing radius={230} words={words1} duration={18} clockwise={true} />
        <OrbitRing radius={290} words={words2} duration={24} clockwise={false} />
        <div style={styles.glowCircle} />

        <img
          src={ebitdaImageUrl}
          alt="EBITDA Diagram"
          style={styles.diagram}
          onError={(e) => { e.target.style.display = "none"; }}
        />

        <div style={styles.titleGroup}>
          <div style={styles.badge}>FINANCIAL OVERVIEW</div>
          <h1 style={styles.title}>EBITDA</h1>
          <p style={styles.subtitle} className="dot-pulse">Loading dashboard</p>
        </div>

        <div style={{ ...styles.corner, top: 24, left: 24, borderTop: "2px solid #fafaff", borderLeft: "2px solid #6C63FF" }} />
        <div style={{ ...styles.corner, top: 24, right: 24, borderTop: "2px solid #6C63FF", borderRight: "2px solid #6C63FF" }} />
        <div style={{ ...styles.corner, bottom: 24, left: 24, borderBottom: "2px solid #6C63FF", borderLeft: "2px solid #6C63FF" }} />
        <div style={{ ...styles.corner, bottom: 24, right: 24, borderBottom: "2px solid #6C63FF", borderRight: "2px solid #6C63FF" }} />
      </div>
    </>
  );
}

const styles = {
  intro: {
    position: "fixed", inset: 0,
    background: "radial-gradient(ellipse at 50% 40%, #111827 0%, #0a0d14 70%)",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif",
    overflow: "hidden",
    zIndex: 9999,
  },
  grid: {
    position: "absolute", inset: 0,
    backgroundImage: `
      linear-gradient(rgba(108,99,255,0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(108,99,255,0.07) 1px, transparent 1px)
    `,
    backgroundSize: "50px 50px",
  },
  glowCircle: {
    position: "absolute",
    width: 240, height: 240,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 70%)",
    animation: "pulseGlow 3s ease-in-out infinite",
    top: "40%", left: "50%",
    transform: "translate(-50%, -50%)",
  },
  diagram: {
    width: 260, height: 260,
    objectFit: "contain",
    position: "relative", zIndex: 2,
    animation: "imgEntrance 1.2s cubic-bezier(.23,1,.32,1) forwards",
    filter: "drop-shadow(0 0 30px rgba(108,99,255,0.6))",
    borderRadius: "50%",
  },
  titleGroup: {
    position: "relative", zIndex: 3,
    textAlign: "center", marginTop: 28,
    animation: "fadeUp 0.8s 0.4s both",
  },
  badge: {
    display: "inline-block",
    fontSize: 10, letterSpacing: "0.25em",
    color: "#6C63FF",
    border: "1px solid rgba(108,99,255,0.4)",
    borderRadius: 20,
    padding: "4px 14px",
    marginBottom: 10,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
  },
  title: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 72,
    color: "#fff",
    letterSpacing: "0.12em",
    lineHeight: 1,
    animation: "titleSlide 1s 0.2s both",
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
    marginTop: 8,
    letterSpacing: "0.05em",
    animation: "subtitleFade 0.8s 0.8s both",
  },
  corner: {
    position: "absolute",
    width: 20, height: 20,
  },
};