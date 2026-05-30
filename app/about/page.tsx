"use client";

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", overflowX: "hidden" }}>

      {/* NAVBAR */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border)",
        boxShadow: "var(--shadow-xs)",
        padding: "0 56px", height: 66,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg, #1A6EBD, #0EA874)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(26,110,189,0.30)",
          }}>
            <span style={{ color: "#fff", fontSize: 13, fontFamily: "var(--font-display)", fontWeight: 800 }}>Rx</span>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-1)", letterSpacing: "-0.3px" }}>
            RecoverX
          </span>
        </a>
        <div style={{ display: "flex", gap: 36, fontSize: 14, fontWeight: 500 }}>
          {([["How It Works", "/#how-it-works"], ["Clinical Trust", "/clinical-trust"], ["About", "/about"]] as [string, string][]).map(([label, href]) => (
            <a key={label} href={href}
              style={{
                color: label === "About" ? "var(--primary)" : "var(--text-2)",
                fontWeight: label === "About" ? 600 : 500,
                textDecoration: "none", transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--primary)")}
              onMouseLeave={e => (e.currentTarget.style.color = label === "About" ? "var(--primary)" : "var(--text-2)")}
            >{label}</a>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <a href="/login" className="btn-ghost" style={{ padding: "8px 20px", fontSize: 14 }}>Sign In</a>
          <a href="/signup" className="btn-primary" style={{ padding: "9px 22px", fontSize: 14 }}>Start Free →</a>
        </div>
      </nav>

      {/* CONTENT */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 40px 96px", display: "flex", flexDirection: "column", gap: 64 }}>

        {/* Block 1 — Mission */}
        <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
          <div className="badge badge-blue" style={{ marginBottom: 16 }}>Our Mission</div>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 800,
            color: "var(--text-1)", letterSpacing: "-1px", lineHeight: 1.15, marginBottom: 20,
          }}>
            Built to fix a broken system
          </h1>
          <p style={{ fontSize: 17, color: "var(--text-2)", lineHeight: 1.8 }}>
            After orthopaedic surgery, over 60% of patients perform home exercises incorrectly — with no one watching.
            RecoverX was built to change that. We combine clinical-grade pose tracking, Google Gemini AI, and your
            surgeon&apos;s own report to give every patient a physiotherapist that&apos;s always there.
          </p>
        </div>

        {/* Block 2 — How It's Different */}
        <div>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div className="badge badge-green" style={{ marginBottom: 14 }}>What makes it different</div>
            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 800,
              color: "var(--text-1)", letterSpacing: "-0.5px",
            }}>Not another generic app</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
            {([
              { icon: "📋", color: "var(--primary)", bg: "var(--primary-light)", title: "Your Report. Your Plan.", desc: "RecoverX reads your actual surgical discharge letter. Every exercise, every angle limit, every restriction — pulled directly from your document. Not a generic protocol." },
              { icon: "📷", color: "var(--accent-dark)", bg: "var(--accent-light)", title: "Clinical Accuracy, Zero Equipment", desc: "MediaPipe BlazePose tracks 33 body landmarks through your laptop camera at 30 frames per second — matching the accuracy of clinical goniometers at 97% correlation. No wearables. No sensors. Just your camera." },
              { icon: "🛡️", color: "var(--secondary)", bg: "var(--secondary-light)", title: "Built on Trusted Science", desc: "Exercise protocols are grounded in AAOS Clinical Practice Guidelines 2022. The app never prescribes anything outside your own surgeon's report, and always reminds you that it supports — never replaces — your physiotherapist." },
            ] as { icon: string; color: string; bg: string; title: string; desc: string }[]).map((card, i) => (
              <div key={i} className="card" style={{ padding: "32px 28px", borderLeft: "3px solid transparent", transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderLeftColor = card.color; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "var(--shadow-hover)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderLeftColor = "transparent"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: card.bg, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>{card.icon}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--text-1)", marginBottom: 10 }}>{card.title}</h3>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Block 3 — Built At */}
        <div className="card" style={{ padding: "48px", background: "linear-gradient(135deg, #fff 0%, var(--primary-light) 100%)", border: "1px solid var(--primary-mid)", textAlign: "center" }}>
          <div className="badge badge-blue" style={{ marginBottom: 16 }}>Origin Story</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "var(--text-1)", marginBottom: 16, letterSpacing: "-0.4px" }}>
            Built at HackDay Agra 2026
          </h2>
          <p style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.8, maxWidth: 680, margin: "0 auto 28px" }}>
            RecoverX was built at HackDay Agra 2026, organised by GDG Agra in partnership with Google and MLH,
            under the Healthcare track. It was designed, built, and shipped in under 24 hours by a student developer
            with a focus on making post-surgery recovery safer and more accessible for everyone.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {["🏆 HackDay Agra 2026", "🏥 Healthcare Track", "🤝 Google × MLH"].map(badge => (
              <span key={badge} style={{ padding: "7px 18px", borderRadius: "var(--r-full)", background: "#fff", border: "1px solid var(--primary-mid)", fontSize: 13, fontWeight: 600, color: "var(--primary)", boxShadow: "var(--shadow-sm)" }}>{badge}</span>
            ))}
          </div>
        </div>

        {/* Block 4 — Technology */}
        <div>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.4px" }}>Powered by</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {([
              { name: "Google Gemini AI", icon: "🧠", sub: "AI coaching & report analysis" },
              { name: "MediaPipe BlazePose", icon: "📷", sub: "33-landmark pose tracking" },
              { name: "AAOS Guidelines", icon: "📋", sub: "2022 clinical protocols" },
              { name: "Supabase", icon: "🗄️", sub: "Secure data & auth" },
            ] as { name: string; icon: string; sub: string }[]).map(tech => (
              <div key={tech.name} className="card" style={{ padding: "28px 20px", textAlign: "center", background: "linear-gradient(145deg, #fff 0%, var(--bg-page) 100%)" }}>
                <div style={{ fontSize: 30, marginBottom: 10 }}>{tech.icon}</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-1)", marginBottom: 6 }}>{tech.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>{tech.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Block 5 — Disclaimer */}
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", fontSize: 13, color: "var(--text-3)", fontWeight: 500, marginBottom: 16 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "var(--primary)" }}>✦</span> AAOS Guidelines</span>
            <span style={{ color: "var(--border)" }}>·</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "var(--accent)" }}>✦</span> 97% Pose Accuracy</span>
            <span style={{ color: "var(--border)" }}>·</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "var(--primary)" }}>✦</span> Data Protected</span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.8, maxWidth: 680, margin: "0 auto", fontStyle: "italic" }}>
            RecoverX is a rehabilitation support tool. It does not constitute medical advice and does not replace
            the guidance of a licensed physiotherapist or orthopaedic surgeon. Always consult your healthcare
            provider before beginning or modifying any exercise program.
          </p>
        </div>

        {/* Block 6 — CTA */}
        <div className="card" style={{ padding: "56px 48px", background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)", border: "none", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", marginBottom: 12 }}>
              Ready to start your recovery?
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.80)", marginBottom: 32 }}>
              Join patients already recovering smarter with AI-guided physiotherapy.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/signup"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "var(--primary)", padding: "13px 30px", borderRadius: "var(--r-full)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", transition: "all 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.20)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)"; }}
              >Begin Recovery →</a>
              <a href="/login"
                style={{ display: "inline-flex", alignItems: "center", color: "rgba(255,255,255,0.90)", fontSize: 14, fontWeight: 500, textDecoration: "none", padding: "13px 20px", transition: "color 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.90)"; }}
              >Sign in instead</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
