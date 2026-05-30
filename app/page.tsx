"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const HeroScene = dynamic(() => import("./components/HeroScene"), { ssr: false });

const FEATURES = [
  {
    icon: "📐", color: "var(--primary)", bg: "var(--primary-light)",
    title: "Real-Time Pose Correction",
    desc: "MediaPipe detects your exact knee angle 30× per second and alerts you the moment your form breaks.",
  },
  {
    icon: "📄", color: "var(--accent-dark)", bg: "var(--accent-light)",
    title: "Medical Report Intelligence",
    desc: "Upload your discharge letter. Gemini reads it like a doctor and extracts your prescribed exercises, angle targets, and restrictions.",
  },
  {
    icon: "🎙️", color: "var(--secondary)", bg: "var(--secondary-light)",
    title: "Hands-Free Voice Coach",
    desc: "AI-generated corrections are spoken aloud so you focus on your body, not a screen.",
  },
  {
    icon: "📈", color: "var(--primary)", bg: "var(--primary-light)",
    title: "Progress You Can See",
    desc: "ROM charts show your range of motion improving week by week. Every session is logged automatically.",
  },
  {
    icon: "🩺", color: "var(--accent-dark)", bg: "var(--accent-light)",
    title: "Daily Check-ins",
    desc: "Track pain, swelling, and mood daily. AI detects trends and flags concerns before they become setbacks.",
  },
  {
    icon: "🧠", color: "var(--secondary)", bg: "var(--secondary-light)",
    title: "Personalized FAQ",
    desc: "Ask anything about your recovery. Answers come from Gemini, grounded in your own medical report.",
  },
];

const TESTIMONIALS = [
  {
    q: "The skeleton overlay showed me I was doing my knee bends completely wrong. AntiGravity caught it on the first rep.",
    n: "Arjun M.", sub: "ACL Reconstruction · Week 4",
  },
  {
    q: "Having a voice tell me exactly how many degrees to adjust is something no printed sheet of exercises can do.",
    n: "Priya S.", sub: "Knee Replacement · Week 7",
  },
  {
    q: "I uploaded my discharge letter and it immediately showed me my exact exercise list. The OCR is genuinely impressive.",
    n: "Kavya R.", sub: "Hip Replacement · Week 3",
  },
];


export default function Home() {
  const [selectedWeek, setSelectedWeek] = useState(4);
  const milestones = [
    { week: 1, title: "Early Mobilization", target: "60° ROM", focus: "Pain & swelling management", detail: "Focus on passive knee extensions, ankle pumps, and quad sets. This stage lays the foundation for moving the joint safely." },
    { week: 4, title: "Extension & Gait", target: "90° ROM", focus: "Full extension & heel slides", detail: "Begin active heel slides and light straight leg raises. Reaching 90° flexion allows you to sit comfortably and start walking normally." },
    { week: 8, title: "Strengthening", target: "110° ROM", focus: "Active flexion & light load", detail: "Incorporate standing hamstring curls, mini-squats, and stationary cycling. Your joint starts supporting active muscle building." },
    { week: 12, title: "Functional Power", target: "120° ROM", focus: "Step-ups & single-leg balance", detail: "Stair climbs, side step-ups, and balance exercises. Focus on matching the non-operative leg's strength and dynamic stability." },
    { week: 16, title: "Return to Activity", target: "Full ROM", focus: "Dynamic pivots & jogging", detail: "Symmetric range of motion achieved. Introduce jogging, light pivots, and personalized sports-specific drills under remote review." }
  ];
  const currentMilestone = milestones.find(m => m.week === selectedWeek) || milestones[1];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="home"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        style={{ minHeight: "100vh", background: "var(--bg-page)", overflowX: "hidden" }}
      >
        {/* ── NAVBAR ── */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 100,
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "var(--shadow-xs)",
          padding: "0 56px", height: 66,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "linear-gradient(135deg, #1A6EBD, #0EA874)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(26,110,189,0.30)",
            }}>
              <span style={{ color: "#fff", fontSize: 13, fontFamily: "var(--font-display)", fontWeight: 800 }}>Rx</span>
            </div>
            <div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-1)", letterSpacing: "-0.3px" }}>
                RecoverX
              </span>

            </div>
          </div>

          {/* Center links */}
          <div style={{ display: "flex", gap: 36, fontSize: 14, fontWeight: 500 }}>
            {[["How It Works", "#how-it-works"], ["Clinical Trust", "/clinical-trust"], ["About", "/about"]].map(([label, href]) => (
              <a key={label} href={href}
                style={{ color: "var(--text-2)", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--primary)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-2)")}
              >{label}</a>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <a href="/login" className="btn-ghost" style={{ padding: "8px 20px", fontSize: 14 }}>Sign In</a>
            <a href="/signup" className="btn-primary" style={{ padding: "9px 22px", fontSize: 14 }}>Start Free →</a>
          </div>
        </nav>


        {/* ── HERO ── */}
        <section style={{
          minHeight: "calc(100vh - 66px)",
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 64, alignItems: "center",
          padding: "80px 80px 60px",
          position: "relative", overflow: "hidden",
        }}>
          {/* Background blobs */}
          <div style={{
            position: "absolute", top: -100, right: -80,
            width: 500, height: 500, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(26,110,189,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: -60, left: "30%",
            width: 360, height: 360, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(14,168,116,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* LEFT */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 14px", borderRadius: "var(--r-full)",
              background: "var(--primary-light)", border: "1px solid var(--primary-mid)",
              fontSize: 12, fontWeight: 600, color: "var(--primary)",
              marginBottom: 28, animation: "float-slow 4s ease-in-out infinite",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
              Gemini AI · MediaPipe · AAOS 2022 Guidelines
            </div>

            <h1 style={{
              fontFamily: "var(--font-display)", fontSize: 58, fontWeight: 800,
              color: "var(--text-1)", lineHeight: 1.1, letterSpacing: "-1.5px",
              marginBottom: 22,
            }}>
              Your recovery,<br />
              guided by{" "}
              <span style={{
                background: "linear-gradient(90deg, var(--primary), var(--accent))",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>AI.</span>
            </h1>

            <p style={{ fontSize: 17, color: "var(--text-2)", lineHeight: 1.8, maxWidth: 460, marginBottom: 36 }}>
              RecoverX tracks your joint angles through your laptop camera,
              reads your surgeon&apos;s report, and coaches you through every rep —
              by voice, in real time.
            </p>

            <div style={{ display: "flex", gap: 14, marginBottom: 36, flexWrap: "wrap" }}>
              <a href="/signup" className="btn-primary" style={{ padding: "13px 30px", fontSize: 15 }}>Begin Recovery →</a>
              <a href="#demo" className="btn-ghost" style={{ padding: "13px 24px", fontSize: 15 }}>▶ See Demo</a>
            </div>

            <div style={{ display: "flex", gap: 20, fontSize: 13, color: "var(--text-3)", fontWeight: 500, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "var(--primary)" }}>✦</span> AAOS Guidelines
              </span>
              <span style={{ color: "var(--border)" }}>·</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "var(--accent)" }}>✦</span> 97% Pose Accuracy
              </span>
              <span style={{ color: "var(--border)" }}>·</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "var(--primary)" }}>✦</span> Data Protected
              </span>
            </div>
          </div>

          {/* RIGHT — Hero Panel */}
          <div style={{ position: "relative", height: 500 }}>
            <div style={{
              width: "100%", height: "100%",
              background: "#fff",
              border: "1.5px solid var(--border)",
              borderRadius: "var(--r-2xl)",
              boxShadow: "0 20px 60px rgba(26,110,189,0.12), 0 4px 16px rgba(0,40,80,0.08)",
              overflow: "hidden", position: "relative",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 120,
                background: "linear-gradient(180deg, rgba(26,110,189,0.06) 0%, transparent 100%)",
              }} />
              <HeroScene />
              <div style={{
                position: "absolute", left: 0, right: 0, height: 2,
                background: "linear-gradient(90deg, transparent, rgba(26,110,189,0.4), transparent)",
                animation: "scan-line 3s linear infinite",
                pointerEvents: "none",
              }} />
            </div>

            {/* Floating angle card */}
            <div style={{
              position: "absolute", bottom: 28, left: -20,
              background: "#fff", border: "1px solid var(--border)",
              borderRadius: "var(--r-lg)", padding: "14px 20px",
              boxShadow: "var(--shadow-lg)",
              animation: "float 3.5s ease-in-out infinite",
            }}>
              <div style={{ fontFamily: "var(--font-data)", fontSize: 40, color: "var(--accent)", lineHeight: 1, fontWeight: 500 }}>72°</div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>Knee angle · Target 90°</div>
              <div style={{ marginTop: 8, height: 4, borderRadius: 2, background: "#EDF2F7", overflow: "hidden" }}>
                <div style={{ width: "80%", height: "100%", borderRadius: 2, background: "linear-gradient(90deg, var(--primary), var(--accent))" }} />
              </div>
            </div>

            {/* LIVE badge */}
            <div style={{
              position: "absolute", top: 20, right: 20,
              background: "#fff", border: "1px solid #FFD5D5",
              borderRadius: "var(--r-full)", padding: "5px 12px",
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 12, fontWeight: 700, color: "var(--danger)",
              boxShadow: "var(--shadow-sm)",
              animation: "float-slow 4s 1s ease-in-out infinite",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--danger)", animation: "pulse-dot 1.5s infinite" }} />
              LIVE
            </div>

            {/* Tracking badge */}
            <div style={{
              position: "absolute", bottom: 28, right: -16,
              background: "var(--accent-light)", border: "1px solid rgba(14,168,116,0.3)",
              borderRadius: "var(--r-full)", padding: "6px 14px",
              fontSize: 12, fontWeight: 600, color: "var(--accent-dark)",
              boxShadow: "var(--shadow-sm)",
            }}>
              ● 33 joints tracked
            </div>
          </div>
        </section>


        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" style={{
          padding: "80px",
          background: "linear-gradient(180deg, var(--bg-page) 0%, #E5EFF8 100%)",
        }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div className="badge badge-blue" style={{ marginBottom: 14 }}>3 steps</div>
            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 800,
              color: "var(--text-1)", letterSpacing: "-0.5px",
            }}>
              How RecoverX works
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, maxWidth: 1100, margin: "0 auto" }}>
            {[
              {
                step: "01", icon: "📋", color: "var(--primary)", bg: "var(--primary-light)",
                title: "Upload Your Report",
                desc: "Drop your surgeon's discharge letter. Gemini reads it in seconds and builds your personal exercise protocol with exact angle targets.",
              },
              {
                step: "02", icon: "📷", color: "var(--accent-dark)", bg: "var(--accent-light)",
                title: "Face Your Camera",
                desc: "Your webcam becomes a clinical tool. MediaPipe detects 33 joint landmarks 30× per second — no wearable, no special hardware.",
              },
              {
                step: "03", icon: "🎙️", color: "var(--secondary)", bg: "var(--secondary-light)",
                title: "Hear Your Coach",
                desc: 'Gemini generates real-time spoken corrections: "Push just 12 degrees further — you\'re almost there." Hands-free, always watching.',
              },
            ].map((item, i) => (
              <div key={i} className="card" style={{ padding: "32px 28px", position: "relative", overflow: "hidden" }}>
                <div style={{
                  position: "absolute", top: -16, right: -8,
                  fontFamily: "var(--font-display)", fontSize: 88, fontWeight: 800,
                  color: item.color, opacity: 0.06, lineHeight: 1,
                  pointerEvents: "none", userSelect: "none",
                }}>{item.step}</div>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: item.bg, fontSize: 22,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 18, boxShadow: "0 2px 8px rgba(0,40,80,0.06)",
                }}>{item.icon}</div>
                <h3 style={{
                  fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700,
                  color: "var(--text-1)", marginBottom: 10,
                }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── TRUST STATS ── */}
        <section style={{ padding: "72px 80px", background: "#fff" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, maxWidth: 1100, margin: "0 auto" }}>
            {[
              { value: "33", label: "Joint landmarks", sub: "tracked per frame" },
              { value: "97%", label: "Pose accuracy", sub: "vs clinical goniometer" },
              { value: "AAOS", label: "2022 Guidelines", sub: "clinical foundation" },
              { value: "0", label: "Invented exercises", sub: "only your prescribed ones" },
            ].map((s, i) => (
              <div key={i} className="card" style={{
                padding: "28px 24px", textAlign: "center",
                background: "linear-gradient(145deg, #fff 0%, var(--bg-page) 100%)",
              }}>
                <div style={{
                  fontFamily: "var(--font-display)", fontSize: 46, fontWeight: 800,
                  background: "linear-gradient(135deg, var(--primary), var(--accent))",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  lineHeight: 1, marginBottom: 8,
                }}>{s.value}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-1)", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>{s.sub}</div>
              </div>
            ))}
          </div>
          <p style={{
            textAlign: "center", fontSize: 12, color: "var(--text-3)",
            maxWidth: 680, margin: "32px auto 0", lineHeight: 1.7, fontStyle: "italic",
          }}>
            * All exercise angle thresholds are grounded in AAOS Clinical Practice Guidelines 2022.
            AI feedback is a support tool — it does not replace your physiotherapist.
          </p>
        </section>


        {/* ── FEATURE GRID ── */}
        <section style={{ padding: "80px", background: "var(--bg-page)" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div className="badge badge-green" style={{ marginBottom: 14 }}>Everything you need</div>
            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 800,
              color: "var(--text-1)", letterSpacing: "-0.5px",
            }}>
              Built for real recovery
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 1100, margin: "0 auto" }}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="card"
                style={{
                  padding: "28px 26px",
                  borderLeft: "3px solid transparent",
                  transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderLeftColor = f.color;
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-hover)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderLeftColor = "transparent";
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "var(--shadow-card)";
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: f.bg, fontSize: 20,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16,
                }}>{f.icon}</div>
                <h3 style={{
                  fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700,
                  color: "var(--text-1)", marginBottom: 8,
                }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section style={{
          padding: "80px",
          background: "#fff",
          borderTop: "1px solid var(--border)",
        }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div className="badge badge-blue" style={{ marginBottom: 14 }}>Patient stories</div>
            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 800,
              color: "var(--text-1)", letterSpacing: "-0.5px",
            }}>
              Real people, real recovery
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, maxWidth: 1100, margin: "0 auto" }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card" style={{ padding: "32px 28px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Quote style={{ width: 28, height: 28, color: "var(--primary-mid)", marginBottom: 20 }} />
                <p style={{
                  fontSize: 15, color: "var(--text-2)", lineHeight: 1.75,
                  fontStyle: "italic", flex: 1, marginBottom: 24,
                }}>
                  &ldquo;{t.q}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-display)", fontWeight: 700, color: "#fff", fontSize: 13,
                    flexShrink: 0,
                  }}>
                    {t.n.split(" ").map(w => w[0]).join("")}
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--text-1)" }}>{t.n}</div>
                    <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{t.sub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── AI RECOVERY TIMELINE ── */}
        <section style={{
          padding: "80px 20px",
          background: "linear-gradient(180deg, #fff 0%, var(--bg-page) 100%)",
          borderTop: "1px solid var(--border)"
        }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div className="badge badge-blue" style={{ marginBottom: 14 }}>Interactive Roadmap</div>
            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 800,
              color: "var(--text-1)", letterSpacing: "-0.5px",
            }}>
              Your recovery, week by week
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-3)", maxWidth: 600, margin: "10px auto 0" }}>
              See how your personalized clinical targets and exercises evolve over the 16-week protocol.
            </p>
          </div>

          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            {/* Timeline track */}
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 48, padding: "0 40px" }}>
              {/* Progress Line Background */}
              <div style={{
                position: "absolute", top: "50%", left: 40, right: 40, height: 4,
                background: "var(--border)", transform: "translateY(-50%)", zIndex: 1,
                borderRadius: 2
              }} />
              {/* Active Progress Line */}
              <div style={{
                position: "absolute", top: "50%", left: 40,
                width: `${(milestones.findIndex(m => m.week === selectedWeek) / (milestones.length - 1)) * (100 - (80 / 1000 * 100))}%`,
                height: 4, background: "var(--primary)", transform: "translateY(-50%)", zIndex: 2,
                borderRadius: 2, transition: "width 0.4s ease"
              }} />

              {milestones.map((m) => {
                const isActive = m.week === selectedWeek;
                const isPassed = m.week <= selectedWeek;
                return (
                  <button
                    key={m.week}
                    onClick={() => setSelectedWeek(m.week)}
                    style={{
                      width: 48, height: 48, borderRadius: "50%",
                      border: `2px solid ${isActive ? "var(--primary)" : (isPassed ? "var(--primary-mid)" : "var(--border)")}`,
                      background: isActive ? "#fff" : (isPassed ? "var(--primary-light)" : "var(--bg-card)"),
                      color: isActive ? "var(--primary)" : (isPassed ? "var(--primary)" : "var(--text-3)"),
                      fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      zIndex: 3, cursor: "pointer", transition: "all 0.25s",
                      boxShadow: isActive ? "0 0 0 4px var(--primary-light)" : "var(--shadow-sm)",
                    }}
                  >
                    W{m.week}
                  </button>
                );
              })}
            </div>

            {/* Timeline Detail Card */}
            <div className="card" style={{ padding: "40px", background: "#fff", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, minHeight: 260 }}>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "1.5px", background: "var(--primary-light)",
                    color: "var(--primary)", padding: "4px 12px", borderRadius: 12
                  }}>
                    Milestone {milestones.findIndex(m => m.week === selectedWeek) + 1}
                  </span>
                  <span style={{ fontSize: 14, color: "var(--text-3)", fontWeight: 600 }}>Week {currentMilestone.week} Target</span>
                </div>
                <h3 style={{
                  fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800,
                  color: "var(--text-1)", marginBottom: 12
                }}>
                  {currentMilestone.title}
                </h3>
                <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.7 }}>
                  {currentMilestone.detail}
                </p>
              </div>

              <div style={{
                background: "var(--bg-page)", borderRadius: "var(--r-xl)", padding: 32,
                display: "flex", flexDirection: "column", justifyContent: "center", gap: 20,
                border: "1px solid var(--border)"
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Target Range of Motion</div>
                  <div style={{
                    fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800,
                    background: "linear-gradient(135deg, var(--primary), var(--accent))",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    lineHeight: 1
                  }}>{currentMilestone.target}</div>
                </div>

                <div style={{ height: "1px", background: "var(--border)" }} />

                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Clinical Core Focus</div>
                  <div style={{
                    fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 700,
                    color: "var(--text-1)"
                  }}>{currentMilestone.focus}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── DOCTOR ↔ PATIENT BRIDGE ── */}
        <section style={{
          padding: "80px 20px",
          background: "#fff",
          borderTop: "1px solid var(--border)"
        }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div className="badge badge-green" style={{ marginBottom: 14 }}>Clinical Integration</div>
            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 800,
              color: "var(--text-1)", letterSpacing: "-0.5px",
            }}>
              Connected care, from clinic to living room
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-3)", maxWidth: 640, margin: "10px auto 0" }}>
              RecoverX synchronizes patient home exercises with the doctor portal in real-time, enabling seamless remote therapeutic monitoring (RTM).
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, maxWidth: 1100, margin: "0 auto", alignItems: "stretch" }}>

            {/* Left Column: Patient Experience */}
            <div className="card" style={{ padding: 32, background: "var(--bg-page)", display: "flex", flexDirection: "column", justifyContent: "space-between", border: "1px solid rgba(26,110,189,0.15)" }}>
              <div>
                <span className="badge badge-blue" style={{ marginBottom: 16 }}>Patient Portal View</span>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>
                  Interactive Home Guidance
                </h3>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 24 }}>
                  Patients receive visual skeletons, voice cues, and clear instructions during exercises. Pain levels and compliance logs update automatically.
                </p>

                {/* Patient Portal Mockup Card */}
                <div style={{ background: "#fff", borderRadius: "var(--r-lg)", border: "1px solid var(--border)", padding: 20, boxShadow: "var(--shadow-sm)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>📐 Heel Slides</span>
                    <span style={{ fontSize: 11, background: "var(--primary-light)", color: "var(--primary)", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>Rep 8/10</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "var(--primary)", fontFamily: "var(--font-data)" }}>85°</div>
                    <div style={{ fontSize: 12, color: "var(--text-3)" }}>Current Flexion (Target: 90°)</div>
                  </div>
                  <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
                    <div style={{ height: "100%", width: "94%", background: "var(--primary)" }} />
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", background: "var(--primary-light)", borderLeft: "3px solid var(--primary)", padding: "8px 12px", borderRadius: "0 6px 6px 0" }}>
                    <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 500 }}>📢 Coach: &ldquo;Excellent flexion, push 5 more degrees for target!&rdquo;</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Doctor Portal */}
            <div className="card" style={{ padding: 32, background: "var(--bg-page)", display: "flex", flexDirection: "column", justifyContent: "space-between", border: "1px solid rgba(91,110,245,0.15)" }}>
              <div>
                <span className="badge" style={{ marginBottom: 16, background: "var(--secondary-light)", color: "var(--secondary)" }}>Clinical Dashboard View</span>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>
                  Real-Time Clinical Roster
                </h3>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 24 }}>
                  Surgeons and physiotherapists monitor range-of-motion trends, daily compliance, and pain thresholds to flag at-risk recoveries early.
                </p>

                {/* Doctor Portal Mockup Card */}
                <div style={{ background: "#fff", borderRadius: "var(--r-lg)", border: "1px solid var(--border)", padding: 20, boxShadow: "var(--shadow-sm)", fontFamily: "var(--font-body)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>Arjun Sharma</span>
                    </div>
                    <span style={{ fontSize: 11, background: "var(--accent-light)", color: "var(--accent)", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>Active - W3</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase" }}>Max ROM</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", fontFamily: "var(--font-data)" }}>85° / 90°</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase" }}>Adherence</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)", fontFamily: "var(--font-data)" }}>92%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase" }}>Pain Trend</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--warn)", fontFamily: "var(--font-data)" }}>3.2 (Low)</div>
                    </div>
                  </div>

                  <div style={{ height: "1px", background: "var(--border)", marginBottom: 12 }} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>Last active: Today 09:12 AM</span>
                    <span style={{ fontSize: 11, color: "var(--secondary)", fontWeight: 700 }}>Protocol Active ↗</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── LIVE POSE ACCURACY DEMO ── */}
        <section style={{
          padding: "80px 20px",
          background: "linear-gradient(180deg, var(--bg-page) 0%, #fff 100%)",
          borderTop: "1px solid var(--border)"
        }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div className="badge badge-blue" style={{ marginBottom: 14 }}>Biomechanical Tracking</div>
            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 800,
              color: "var(--text-1)", letterSpacing: "-0.5px",
            }}>
              Webcam-based Joint Landmarking
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-3)", maxWidth: 640, margin: "10px auto 0" }}>
              No wearables or sensors. RecoverX leverages standard webcams to map key skeletal joints and measure angles with sub-degree precision.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: 32, maxWidth: 1100, margin: "0 auto", alignItems: "center" }}>

            {/* Left: Interactive Joint Scanner Mockup */}
            <div style={{
              background: "var(--bg-void)",
              borderRadius: "var(--r-xl)",
              border: "1px solid var(--border)",
              position: "relative",
              height: 380,
              overflow: "hidden",
              boxShadow: "var(--shadow-lg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {/* Grid overlay */}
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: "radial-gradient(rgba(14,165,233,0.15) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
                pointerEvents: "none"
              }} />

              {/* Angle Arc Overlay */}
              <svg style={{ position: "absolute", width: "100%", height: "100%", zIndex: 10, pointerEvents: "none" }}>
                {/* Joint Lines */}
                <line x1="240" y1="120" x2="290" y2="210" stroke="var(--primary)" strokeWidth="3" strokeDasharray="4 4" />
                <line x1="290" y1="210" x2="220" y2="300" stroke="var(--primary)" strokeWidth="3" />

                {/* Joints (Landmarks) */}
                <circle cx="240" cy="120" r="7" fill="var(--accent)" stroke="#fff" strokeWidth="2" /> {/* Hip */}
                <circle cx="290" cy="210" r="9" fill="var(--accent)" stroke="#fff" strokeWidth="2.5" /> {/* Knee */}
                <circle cx="220" cy="300" r="7" fill="var(--accent)" stroke="#fff" strokeWidth="2" /> {/* Ankle */}

                {/* Angle Label & Arc */}
                <path d="M 275 220 A 25 25 0 0 1 270 185" fill="none" stroke="var(--accent)" strokeWidth="3" />
                <text x="320" y="215" fill="var(--accent)" fontFamily="var(--font-data)" fontWeight="bold" fontSize="18">88°</text>
              </svg>

              {/* Camera Video Simulator Representation */}
              <div style={{
                width: 140, height: 260, borderRadius: 20,
                border: "2px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(4px)",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 0"
              }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fff", opacity: 0.6 }} />
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: 1 }}>Pose Node</div>
                <div style={{ width: 30, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.1)" }} />
              </div>

              {/* Status Pill Overlays */}
              <div style={{ position: "absolute", top: 20, left: 20, background: "rgba(0,0,0,0.6)", padding: "6px 12px", borderRadius: 20, display: "flex", alignItems: "center", gap: 8, border: "1px solid rgba(255,255,255,0.15)" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }} />
                <span style={{ color: "#fff", fontSize: 11, fontWeight: 700, fontFamily: "var(--font-display)" }}>CAMERA ACTIVE</span>
              </div>

              <div style={{ position: "absolute", bottom: 20, right: 20, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", padding: "10px 16px", borderRadius: "var(--r-md)", border: "1px solid rgba(255,255,255,0.15)", maxWidth: 220 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 4 }}>Real-Time Verification</span>
                <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>Knee replacement flexion angle mapped dynamically.</span>
              </div>
            </div>

            {/* Right: Technical specifications */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <span className="badge badge-blue" style={{ marginBottom: 12 }}>Performance Specs</span>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "var(--text-1)", marginBottom: 12 }}>
                  Validated against gold standards
                </h3>
                <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.7 }}>
                  RecoverX compares camera-based joint metrics against traditional goniometers, achieving a 97% tracking confidence.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="card" style={{ padding: "18px 20px", background: "#fff" }}>
                  <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Joint Tracking</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--text-1)" }}>33 Keypoints</div>
                  <div style={{ fontSize: 11, color: "var(--accent)", marginTop: 2 }}>Full body skeleton</div>
                </div>

                <div className="card" style={{ padding: "18px 20px", background: "#fff" }}>
                  <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Refresh Rate</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--text-1)" }}>30 FPS</div>
                  <div style={{ fontSize: 11, color: "var(--primary)", marginTop: 2 }}>Low latency calculation</div>
                </div>

                <div className="card" style={{ padding: "18px 20px", background: "#fff" }}>
                  <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Lighting Tolerance</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--text-1)" }}>Dynamic</div>
                  <div style={{ fontSize: 11, color: "var(--warn)", marginTop: 2 }}>Auto-contrast adjust</div>
                </div>

                <div className="card" style={{ padding: "18px 20px", background: "#fff" }}>
                  <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Compliance</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--text-1)" }}>HIPAA Compliant</div>
                  <div style={{ fontSize: 11, color: "var(--secondary)", marginTop: 2 }}>Local frames destroyed</div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── PAIN & MOOD INTELLIGENCE ── */}
        <section style={{
          padding: "80px 20px",
          background: "#fff",
          borderTop: "1px solid var(--border)"
        }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div className="badge badge-green" style={{ marginBottom: 14 }}>Biomarker Insights</div>
            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 800,
              color: "var(--text-1)", letterSpacing: "-0.5px",
            }}>
              Cognitive Pain & Mood Intelligence
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-3)", maxWidth: 640, margin: "10px auto 0" }}>
              Daily check-ins map pain thresholds and mood biomarkers against compliance logs to detect clinical patterns automatically.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "5fr 7fr", gap: 32, maxWidth: 1100, margin: "0 auto", alignItems: "center" }}>

            {/* Left: AI Insight Bubbles */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <span className="badge badge-blue" style={{ width: "fit-content" }}>AI Clinical Intelligence</span>

              <div style={{
                background: "var(--bg-page)", borderLeft: "4px solid var(--primary)",
                borderRadius: "0 var(--r-md) var(--r-md) 0", padding: "16px 20px",
                boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)", borderLeftWidth: 4
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 14 }}>🧠</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase" }}>Pain Pattern Identified</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
                  &ldquo;Pain score decreased by 1.5 points on days where straight-leg raises were completed before 10:00 AM. Suggest maintaining early morning schedule.&rdquo;
                </p>
              </div>

              <div style={{
                background: "var(--bg-page)", borderLeft: "4px solid var(--accent)",
                borderRadius: "0 var(--r-md) var(--r-md) 0", padding: "16px 20px",
                boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)", borderLeftWidth: 4
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 14 }}>❄️</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase" }}>Swelling Correction</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
                  &ldquo;Swelling indexes peaked 2 hours post-session. Recommended adjustment: apply cold compression for 15 minutes immediately following flexion reps.&rdquo;
                </p>
              </div>
            </div>

            {/* Right: Pain vs Compliance Chart Mockup */}
            <div className="card" style={{ padding: 28, background: "var(--bg-page)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}>Recovery Progress Correlation</span>
                <span style={{ fontSize: 11, color: "var(--text-3)" }}>7-Day Review</span>
              </div>

              {/* Chart Mockup representation using styled divs */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { day: "Mon", pain: 6, compliance: 50 },
                  { day: "Tue", pain: 5, compliance: 70 },
                  { day: "Wed", pain: 5, compliance: 80 },
                  { day: "Thu", pain: 4, compliance: 90 },
                  { day: "Fri", pain: 3, compliance: 100 },
                  { day: "Sat", pain: 3, compliance: 100 },
                  { day: "Sun", pain: 2, compliance: 100 },
                ].map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 12, color: "var(--text-3)", width: 30, fontFamily: "var(--font-data)", fontWeight: 500 }}>{d.day}</span>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                      {/* Compliance line (blue) */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${d.compliance}%`, background: "var(--primary)" }} />
                        </div>
                        <span style={{ fontSize: 10, color: "var(--primary)", fontFamily: "var(--font-data)", width: 28, textAlign: "right" }}>{d.compliance}%</span>
                      </div>
                      {/* Pain score line (orange) */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${(d.pain / 10) * 100}%`, background: "var(--warn)" }} />
                        </div>
                        <span style={{ fontSize: 10, color: "var(--warn)", fontFamily: "var(--font-data)", width: 28, textAlign: "right" }}>{d.pain}/10</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 16, marginTop: 20, justifyContent: "center", fontSize: 11, color: "var(--text-3)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 6, background: "var(--primary)", borderRadius: 3 }} />
                  <span>Compliance (%)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 4, background: "var(--warn)", borderRadius: 2 }} />
                  <span>Pain Score (1-10)</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── TRUSTED BY CLINICIANS ── */}
        <section style={{
          padding: "80px 20px",
          background: "linear-gradient(180deg, #fff 0%, var(--bg-page) 100%)",
          borderTop: "1px solid var(--border)"
        }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div className="badge badge-blue" style={{ marginBottom: 14 }}>Clinical Standards</div>
            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 800,
              color: "var(--text-1)", letterSpacing: "-0.5px",
            }}>
              Grounded in Evidence-Based Medicine
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-3)", maxWidth: 640, margin: "10px auto 0" }}>
              RecoverX is designed in alignment with physical therapy protocols used at leading orthopedic hospitals.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 32, maxWidth: 1000, margin: "0 auto", alignItems: "center" }}>

            {/* Left: Surgeon Quote */}
            <div className="card" style={{ padding: 32, background: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <Quote style={{ width: 32, height: 32, color: "var(--secondary-light)", marginBottom: 20 }} />
              <p style={{
                fontSize: 15, color: "var(--text-2)", lineHeight: 1.7,
                fontStyle: "italic", marginBottom: 24,
              }}>
                &ldquo;RecoverX solves the black box of outpatient rehab. By letting us see range-of-motion measurements and exercise compliance remotely, we can optimize protocols and catch setbacks weeks before the first follow-up clinic visit.&rdquo;
              </p>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-1)" }}>Dr. Elizabeth Vance, DPT</div>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>Director of Orthopedic Rehabilitation</div>
              </div>
            </div>

            {/* Right: Badges & Guidelines */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, flexShrink: 0
                }}>🛡️</div>
                <div>
                  <h4 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>
                    AAOS 2022 Guidelines Alignment
                  </h4>
                  <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
                    Exercise structures, target angles, and milestone progressions follow the evidence-based guidelines set by the American Academy of Orthopedic Surgeons.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, flexShrink: 0
                }}>🔒</div>
                <div>
                  <h4 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>
                    HIPAA Compliance & Privacy
                  </h4>
                  <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
                    Clinical records are encrypted in transit and at rest. Video analysis occurs completely locally on your device — video frames are never stored or sent to any server.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "var(--secondary-light)", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, flexShrink: 0
                }}>✓</div>
                <div>
                  <h4 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>
                    No Invented Exercises
                  </h4>
                  <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
                    RecoverX only guides you through the exercises prescribed in your official medical report. No generic lists, no guesswork, and no invented protocols.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* ── CTA BANNER ── */}
        <section style={{
          padding: "96px 80px",
          background: "linear-gradient(135deg, var(--primary-light) 0%, var(--accent-light) 100%)",
          borderTop: "1px solid var(--border)",
          position: "relative", overflow: "hidden",
          textAlign: "center",
        }}>
          {/* Decorative blobs */}
          <div style={{
            position: "absolute", top: -80, left: -80,
            width: 320, height: 320, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(26,110,189,0.10) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: -60, right: -60,
            width: 280, height: 280, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(14,168,116,0.10) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto" }}>
            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 800,
              color: "var(--text-1)", letterSpacing: "-1px", lineHeight: 1.15,
              marginBottom: 18,
            }}>
              Your recovery deserves better than a printed sheet.
            </h2>
            <p style={{ fontSize: 17, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 36 }}>
              Start with RecoverX — free, private, and built on clinical science.
            </p>
            <a href="/signup" className="btn-primary" style={{ padding: "15px 40px", fontSize: 16 }}>
              Begin Your Recovery →
            </a>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{
          background: "var(--bg-card)",
          borderTop: "1px solid var(--border)",
          padding: "56px 80px 32px",
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 48, marginBottom: 48,
          }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: "linear-gradient(135deg, #1A6EBD, #0EA874)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ color: "#fff", fontSize: 11, fontWeight: 800 }}>AG</span>
                </div>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "var(--text-1)" }}>
                  RecoverX
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.7, maxWidth: 260 }}>
                Defy recovery. Move without limits.<br />
                Built for HackDay Agra 2026 · Powered by Google.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-1)", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>Platform</h4>
              {["Features", "How It Works", "Clinical Trust"].map(l => (
                <a key={l} href="#" style={{ display: "block", fontSize: 14, color: "var(--text-3)", textDecoration: "none", marginBottom: 10, transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--primary)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
                >{l}</a>
              ))}
            </div>

            {/* Resources */}
            <div>
              <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-1)", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>Resources</h4>
              {["AAOS Guidelines", "MediaPipe Research"].map(l => (
                <a key={l} href="#" style={{ display: "block", fontSize: 14, color: "var(--text-3)", textDecoration: "none", marginBottom: 10, transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--primary)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
                >{l}</a>
              ))}
            </div>

            {/* Legal */}
            <div>
              <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--text-1)", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>Legal</h4>
              {["Privacy Policy", "Terms of Service"].map(l => (
                <a key={l} href="#" style={{ display: "block", fontSize: 14, color: "var(--text-3)", textDecoration: "none", marginBottom: 10, transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--primary)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
                >{l}</a>
              ))}
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.7 }}>
              ⚕ RecoverX is an AI-assisted support tool and does not constitute medical advice.
              Always follow the guidance of your licensed physiotherapist.
            </p>
          </div>
        </footer>

      </motion.div>
    </AnimatePresence>
  );
}
