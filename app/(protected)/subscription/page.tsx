"use client";

import { useState } from "react";
import { Check, Zap, Star, Shield, Crown } from "lucide-react";

type Cycle = "weekly" | "monthly";

const plans = [
  {
    id: "basic",
    icon: "🌱",
    tag: null,
    label: "PLAN 1 — BASIC",
    name: "Basic Care",
    description:
      "Perfect for getting started. Track your exercises, log daily check-ins, and access the AI coach to guide your recovery journey.",
    weeklyPrice: 49,
    monthlyPrice: 149,
    color: "var(--primary)",
    colorLight: "var(--primary-light)",
    colorMid: "var(--primary-mid)",
    features: [
      "Up to 3 exercise sessions/week",
      "Daily pain & mood check-in",
      "AI Coach (basic responses)",
      "Progress charts & reports",
      "Find nearby doctors",
    ],
    cta: "Start Basic Plan",
    ctaStyle: "outline" as const,
  },
  {
    id: "pro",
    icon: "⚡",
    tag: "MOST POPULAR",
    label: "PLAN 2 — PRO",
    name: "Pro Recovery",
    description:
      "The complete recovery toolkit. Unlimited sessions, real-time pose analysis, doctor messaging, and priority AI support.",
    weeklyPrice: 99,
    monthlyPrice: 299,
    color: "var(--primary)",
    colorLight: "var(--primary-light)",
    colorMid: "var(--primary-mid)",
    features: [
      "Unlimited exercise sessions",
      "Real-time AI pose correction",
      "Doctor messaging & reports",
      "Advanced analytics dashboard",
      "Priority AI Coach support",
      "Emergency SOS alerts",
      "Prescription tracking",
    ],
    cta: "Get Pro Plan",
    ctaStyle: "primary" as const,
  },
  {
    id: "clinic",
    icon: "🏥",
    tag: "FOR CLINICS",
    label: "PLAN 3 — CLINIC",
    name: "Clinic & Hospital",
    description:
      "Built for physiotherapy clinics and hospitals. Manage multiple patients, assign custom protocols, and track outcomes at scale.",
    weeklyPrice: 499,
    monthlyPrice: 1499,
    color: "var(--accent)",
    colorLight: "var(--accent-light)",
    colorMid: "rgba(14,168,116,0.25)",
    features: [
      "Up to 50 patient profiles",
      "Custom rehab protocol builder",
      "Bulk progress reports (PDF)",
      "Doctor & staff multi-login",
      "Patient adherence alerts",
      "Dedicated account manager",
      "API access & EHR integration",
    ],
    cta: "Contact for Clinic Plan",
    ctaStyle: "accent" as const,
  },
];

export default function SubscriptionPage() {
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div
      className="animate-in fade-in duration-500 pb-16"
      style={{ maxWidth: 1100, margin: "0 auto" }}
    >
      {/* ── HERO ── */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 14px",
            borderRadius: 999,
            background: "var(--primary-light)",
            border: "1px solid var(--primary-mid)",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--primary)",
            letterSpacing: 1.2,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          <Zap style={{ width: 11, height: 11 }} />
          Subscription Plans
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 38,
            fontWeight: 800,
            color: "var(--text-1)",
            letterSpacing: "-0.5px",
            marginBottom: 12,
          }}
        >
          Choose Your Recovery Plan
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-2)", maxWidth: 480, margin: "0 auto 28px" }}>
          Affordable plans designed for patients, individuals, and clinics across India.
          Cancel anytime.
        </p>

        {/* Billing toggle */}
        <div
          style={{
            display: "inline-flex",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 999,
            padding: 4,
            gap: 4,
            boxShadow: "var(--shadow-xs)",
          }}
        >
          {(["weekly", "monthly"] as Cycle[]).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              style={{
                padding: "8px 22px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                background: cycle === c ? "var(--primary)" : "transparent",
                color: cycle === c ? "#fff" : "var(--text-3)",
                transition: "all 0.18s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {c === "monthly" && (
                <span
                  style={{
                    fontSize: 10,
                    background: "var(--accent)",
                    color: "#fff",
                    padding: "1px 6px",
                    borderRadius: 999,
                    fontWeight: 700,
                    letterSpacing: 0.3,
                  }}
                >
                  SAVE 40%
                </span>
              )}
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── PLAN CARDS ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 24,
          alignItems: "start",
        }}
      >
        {plans.map((plan) => {
          const price = cycle === "weekly" ? plan.weeklyPrice : plan.monthlyPrice;
          const isPro = plan.id === "pro";
          const isSelected = selected === plan.id;

          return (
            <div
              key={plan.id}
              style={{
                background: "var(--bg-card)",
                borderRadius: 20,
                border: `2px solid ${isSelected ? plan.color : isPro ? plan.colorMid : "var(--border)"}`,
                boxShadow: isPro
                  ? "0 8px 32px rgba(26,110,189,0.14), 0 2px 8px rgba(0,40,80,0.06)"
                  : "var(--shadow-card)",
                padding: "28px 26px",
                position: "relative",
                transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
                transform: isPro ? "translateY(-6px)" : "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = isPro ? "translateY(-10px)" : "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(26,110,189,0.16), 0 4px 12px rgba(0,40,80,0.08)";
                e.currentTarget.style.borderColor = plan.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = isPro ? "translateY(-6px)" : "none";
                e.currentTarget.style.boxShadow = isPro
                  ? "0 8px 32px rgba(26,110,189,0.14), 0 2px 8px rgba(0,40,80,0.06)"
                  : "var(--shadow-card)";
                e.currentTarget.style.borderColor = isSelected
                  ? plan.color
                  : isPro
                  ? plan.colorMid
                  : "var(--border)";
              }}
            >
              {/* Tag badge */}
              {plan.tag && (
                <div
                  style={{
                    position: "absolute",
                    top: -13,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: plan.id === "clinic" ? "var(--accent)" : "var(--primary)",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 1.2,
                    padding: "4px 14px",
                    borderRadius: 999,
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 8px rgba(26,110,189,0.30)",
                  }}
                >
                  {plan.tag === "MOST POPULAR" && <Star style={{ width: 9, height: 9, display: "inline", marginRight: 4, marginBottom: 1 }} />}
                  {plan.tag === "FOR CLINICS" && <Shield style={{ width: 9, height: 9, display: "inline", marginRight: 4, marginBottom: 1 }} />}
                  {plan.tag}
                </div>
              )}

              {/* Icon + label */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: plan.colorLight,
                    border: `1px solid ${plan.colorMid}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  {plan.icon}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 1.2,
                    color: plan.color,
                    textTransform: "uppercase",
                  }}
                >
                  {plan.label}
                </span>
              </div>

              {/* Name */}
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 22,
                  fontWeight: 800,
                  color: "var(--text-1)",
                  marginBottom: 10,
                }}
              >
                {plan.name}
              </div>

              {/* Description */}
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-2)",
                  lineHeight: 1.6,
                  marginBottom: 20,
                  minHeight: 56,
                }}
              >
                {plan.description}
              </p>

              {/* Price box */}
              <div
                style={{
                  background: plan.colorLight,
                  border: `1px solid ${plan.colorMid}`,
                  borderRadius: 14,
                  padding: "16px 18px",
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 34,
                      fontWeight: 800,
                      color: plan.color,
                      lineHeight: 1,
                    }}
                  >
                    ₹{price}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 500 }}>
                    / {cycle === "weekly" ? "week" : "month"}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    color: plan.color,
                    background: "#fff",
                    border: `1px solid ${plan.colorMid}`,
                    padding: "4px 10px",
                    borderRadius: 999,
                    textTransform: "uppercase",
                  }}
                >
                  {cycle === "weekly" ? "BILLED WEEKLY" : "BILLED MONTHLY"}
                </span>
              </div>

              {/* Features */}
              <ul style={{ listStyle: "none", marginBottom: 24, display: "flex", flexDirection: "column", gap: 9 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: plan.colorLight,
                        border: `1px solid ${plan.colorMid}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      <Check style={{ width: 10, height: 10, color: plan.color, strokeWidth: 3 }} />
                    </div>
                    <span style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <button
                onClick={() => setSelected(plan.id)}
                style={{
                  width: "100%",
                  padding: "13px 20px",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  cursor: "pointer",
                  border: plan.ctaStyle === "outline" ? "1.5px solid var(--primary)" : "none",
                  background:
                    plan.ctaStyle === "primary"
                      ? "var(--primary)"
                      : plan.ctaStyle === "accent"
                      ? "var(--accent)"
                      : "transparent",
                  color:
                    plan.ctaStyle === "outline" ? "var(--primary)" : "#fff",
                  boxShadow:
                    plan.ctaStyle === "primary"
                      ? "0 4px 16px rgba(26,110,189,0.35)"
                      : plan.ctaStyle === "accent"
                      ? "0 4px 16px rgba(14,168,116,0.30)"
                      : "none",
                  transition: "all 0.18s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  if (plan.ctaStyle === "primary") e.currentTarget.style.background = "var(--primary-dark)";
                  if (plan.ctaStyle === "accent") e.currentTarget.style.background = "var(--accent-dark)";
                  if (plan.ctaStyle === "outline") e.currentTarget.style.background = "var(--primary-light)";
                }}
                onMouseLeave={(e) => {
                  if (plan.ctaStyle === "primary") e.currentTarget.style.background = "var(--primary)";
                  if (plan.ctaStyle === "accent") e.currentTarget.style.background = "var(--accent)";
                  if (plan.ctaStyle === "outline") e.currentTarget.style.background = "transparent";
                }}
              >
                {isPro && <Crown style={{ width: 14, height: 14 }} />}
                {plan.cta} →
              </button>

              {/* Selected confirmation */}
              {isSelected && (
                <div
                  style={{
                    marginTop: 12,
                    textAlign: "center",
                    fontSize: 12,
                    color: "var(--accent-dark)",
                    fontWeight: 600,
                    background: "var(--accent-light)",
                    border: "1px solid rgba(14,168,116,0.25)",
                    borderRadius: 8,
                    padding: "7px 12px",
                  }}
                >
                  ✅ Plan selected — payment coming soon
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── TRUST STRIP ── */}
      <div
        style={{
          marginTop: 52,
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "24px 32px",
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "var(--shadow-xs)",
        }}
      >
        {[
          { icon: "🔒", text: "Secure payments via Razorpay" },
          { icon: "🔄", text: "Cancel anytime, no questions asked" },
          { icon: "🇮🇳", text: "Made for India — prices in ₹" },
          { icon: "🏥", text: "Trusted by physiotherapists" },
        ].map(({ icon, text }) => (
          <div
            key={text}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "var(--text-2)",
              fontWeight: 500,
            }}
          >
            <span style={{ fontSize: 16 }}>{icon}</span>
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}
