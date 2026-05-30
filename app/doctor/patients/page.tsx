"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search, SlidersHorizontal, ChevronRight, TrendingUp,
  TrendingDown, Minus,
  Activity, MessageCircle, Phone, Mail, Plus,
} from "lucide-react";
import { PATIENTS, statusConfig, type Patient, type PatientStatus } from "./data";

/* ── Re-export types for use in this file ─────────────────────────── */
type TrendDir = Patient["trend"];
type StatusFilter = "all" | PatientStatus;

const STATUS_FILTERS: StatusFilter[] = ["all", "excellent", "on-track", "attention", "at-risk"];

function TrendIcon({ trend }: { trend: TrendDir }) {
  if (trend === "up")   return <TrendingUp   style={{ width: 14, height: 14, color: "var(--accent)" }} />;
  if (trend === "down") return <TrendingDown style={{ width: 14, height: 14, color: "var(--danger)" }} />;
  return <Minus style={{ width: 14, height: 14, color: "var(--text-3)" }} />;
}

function RomRing({ value, target }: { value: number; target: number }) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 90 ? "#0EA874" : pct >= 65 ? "#1A6EBD" : "#E8930A";
  return (
    <div style={{ position: "relative", width: 60, height: 60 }}>
      <svg width={60} height={60} viewBox="0 0 60 60" style={{ transform: "rotate(-90deg)" }}>
        <circle cx={30} cy={30} r={r} fill="none" stroke="#EDF2F7" strokeWidth={5} />
        <circle cx={30} cy={30} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.6s" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 13, fontWeight: 800, fontFamily: "var(--font-data)", color: "var(--text-1)", lineHeight: 1 }}>{pct}%</span>
      </div>
    </div>
  );
}

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = PATIENTS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.injury.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto flex flex-col gap-8 pb-12">

      {/* ── Header Row ── */}
      <section style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--text-1)", marginBottom: 4 }}>
            Patient Directory
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-2)" }}>
            {PATIENTS.length} active patients under your care
          </p>
        </div>
        <button
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "var(--secondary)", color: "#fff",
            border: "none", borderRadius: "var(--r-full)",
            padding: "11px 22px", fontSize: 14, fontWeight: 600,
            cursor: "pointer", boxShadow: "0 4px 16px rgba(91,110,245,0.30)",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(91,110,245,0.40)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 16px rgba(91,110,245,0.30)"; }}
        >
          <Plus style={{ width: 16, height: 16 }} /> Add Patient
        </button>
      </section>

      {/* ── Stats Row ── */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[
          { label: "Total Patients",   value: PATIENTS.length, icon: "👥", color: "var(--primary)" },
          { label: "Excellent / On Track", value: PATIENTS.filter(p => ["excellent","on-track"].includes(p.status)).length, icon: "✅", color: "var(--accent)" },
          { label: "Need Attention",   value: PATIENTS.filter(p => p.status === "attention").length, icon: "⚠️", color: "var(--warn)" },
          { label: "At Risk",          value: PATIENTS.filter(p => p.status === "at-risk").length,   icon: "🚨", color: "var(--danger)" },
        ].map(stat => (
          <div key={stat.label} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "18px 20px", boxShadow: "var(--shadow-card)" }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 800, color: stat.color, lineHeight: 1, marginBottom: 4 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-3)" }}>{stat.label}</div>
          </div>
        ))}
      </section>

      {/* ── Search + Filters ── */}
      <section style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--text-3)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patients by name or condition..."
            style={{ paddingLeft: "42px !important" } as React.CSSProperties}
          />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {STATUS_FILTERS.map(f => {
            const cfg = f !== "all" ? statusConfig[f] : null;
            const active = statusFilter === f;
            return (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                style={{
                  padding: "9px 16px", borderRadius: "var(--r-full)", fontSize: 12,
                  fontWeight: 600, cursor: "pointer", textTransform: "capitalize",
                  border: `1px solid ${active ? (cfg?.color ?? "var(--primary)") : "var(--border)"}`,
                  background: active ? (cfg?.bg ?? "var(--primary-light)") : "transparent",
                  color: active ? (cfg?.color ?? "var(--primary)") : "var(--text-3)",
                  transition: "all 0.15s",
                }}
              >
                {f === "all" ? "All" : f.replace("-", " ")}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 4, padding: "4px", background: "var(--bg-subtle)", borderRadius: "var(--r-sm)", border: "1px solid var(--border)" }}>
          {(["grid", "list"] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: "6px 12px", borderRadius: "var(--r-sm)", fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: view === v ? "#fff" : "transparent",
                color: view === v ? "var(--text-1)" : "var(--text-3)",
                border: view === v ? "1px solid var(--border)" : "1px solid transparent",
                boxShadow: view === v ? "var(--shadow-xs)" : "none", transition: "all 0.15s",
              }}
            >
              {v === "grid" ? "⊞ Grid" : "☰ List"}
            </button>
          ))}
        </div>
        <button style={{ padding: "9px 14px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text-3)", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <SlidersHorizontal style={{ width: 14, height: 14 }} /> Filter
        </button>
      </section>

      {/* ── Patient Cards ── */}
      <section style={view === "grid"
        ? { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }
        : { display: "flex", flexDirection: "column", gap: 12 }
      }>
        {filtered.map(p => {
          const st = statusConfig[p.status];
          if (view === "grid") {
            return (
              <div
                key={p.id}
                style={{
                  background: "#fff", border: "1px solid var(--border)",
                  borderRadius: "var(--r-xl)", padding: 20,
                  boxShadow: "var(--shadow-card)", transition: "all 0.22s",
                  display: "flex", flexDirection: "column", gap: 16,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "var(--shadow-hover)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "var(--shadow-card)"; e.currentTarget.style.borderColor = "var(--border)"; }}
              >
                {/* Top row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                      background: "linear-gradient(135deg, var(--secondary-light), var(--primary-light))",
                      border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 800, color: "var(--secondary)",
                    }}>
                      {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-3)" }}>Age {p.age} · {p.gender}</div>
                    </div>
                  </div>
                  <span style={{ background: st.bg, color: st.color, padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
                    {st.label}
                  </span>
                </div>

                {/* Injury */}
                <div style={{ background: "var(--bg-subtle)", borderRadius: "var(--r-md)", padding: "8px 12px", fontSize: 13, color: "var(--text-2)", fontWeight: 500 }}>
                  {p.injury} — <span style={{ color: "var(--primary)", fontFamily: "var(--font-data)", fontSize: 12 }}>W{p.week}/{p.totalWeeks}</span>
                </div>

                {/* ROM Ring + stats */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <RomRing value={p.rom} target={p.romTarget} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: "var(--text-3)" }}>ROM</span>
                      <span style={{ fontFamily: "var(--font-data)", color: "var(--text-1)", fontWeight: 600 }}>{p.rom}° / {p.romTarget}°</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: "var(--text-3)" }}>Pain</span>
                      <span style={{ fontFamily: "var(--font-data)", fontWeight: 600, color: p.pain >= 6 ? "var(--danger)" : p.pain >= 4 ? "var(--warn)" : "var(--accent)" }}>{p.pain}/10</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, alignItems: "center" }}>
                      <span style={{ color: "var(--text-3)" }}>Adherence</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-data)", fontWeight: 600, color: "var(--text-1)" }}>
                        <TrendIcon trend={p.trend} />{p.adherence}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Summary */}
                <div style={{ background: "var(--primary-light)", border: "1px solid var(--primary-mid)", borderRadius: "var(--r-md)", padding: "8px 12px", fontSize: 11, color: "var(--primary-dark)", lineHeight: 1.6 }}>
                  🤖 {p.aiSummary}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                  <Link
                    href={`/doctor/patients/${p.id}`}
                    style={{
                      flex: 1, textAlign: "center", padding: "9px 12px",
                      background: "var(--secondary)", color: "#fff",
                      borderRadius: "var(--r-full)", fontSize: 12, fontWeight: 600,
                      textDecoration: "none", transition: "all 0.15s",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    View Details <ChevronRight style={{ width: 12, height: 12 }} />
                  </Link>
                  <button title="Message" style={{ padding: "9px 12px", borderRadius: "var(--r-full)", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text-3)", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "var(--primary-light)"; e.currentTarget.style.color = "var(--primary)"; e.currentTarget.style.borderColor = "var(--primary)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
                    <MessageCircle style={{ width: 14, height: 14 }} />
                  </button>
                  <button title="Call" style={{ padding: "9px 12px", borderRadius: "var(--r-full)", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text-3)", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "var(--accent-light)"; e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.borderColor = "var(--accent)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
                    <Phone style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>
            );
          }

          // List view
          return (
            <div
              key={p.id}
              style={{
                background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-lg)",
                padding: "16px 20px", boxShadow: "var(--shadow-card)", display: "flex",
                alignItems: "center", gap: 20, transition: "all 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
            >
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, var(--secondary-light), var(--primary-light))", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 800, color: "var(--secondary)", flexShrink: 0 }}>
                {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div style={{ flex: "0 0 180px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>Age {p.age} · Last: {p.lastSession}</div>
              </div>
              <div style={{ flex: 1, fontSize: 13, color: "var(--text-2)" }}>{p.injury}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, fontFamily: "var(--font-data)", color: "var(--primary)", fontWeight: 600 }}>{p.rom}°/{p.romTarget}°</span>
                <TrendIcon trend={p.trend} />
              </div>
              <div style={{ fontFamily: "var(--font-data)", fontSize: 13, fontWeight: 600, color: p.pain >= 6 ? "var(--danger)" : p.pain >= 4 ? "var(--warn)" : "var(--accent)", minWidth: 32 }}>{p.pain}/10</div>
              <div style={{ fontFamily: "var(--font-data)", fontSize: 13, minWidth: 38, color: "var(--text-2)" }}>{p.adherence}%</div>
              <span style={{ background: st.bg, color: st.color, padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{st.label}</span>
              <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                <button style={{ padding: "6px 8px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text-3)" }}><Mail style={{ width: 13, height: 13 }} /></button>
                <button style={{ padding: "6px 8px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text-3)" }}><Phone style={{ width: 13, height: 13 }} /></button>
                <Link href={`/doctor/patients/${p.id}`} style={{ padding: "6px 8px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center" }}>
                  <ChevronRight style={{ width: 13, height: 13 }} />
                </Link>
              </div>
            </div>
          );
        })}
      </section>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-3)" }}>
          <Activity style={{ width: 40, height: 40, margin: "0 auto 12px", opacity: 0.4 }} />
          <p style={{ fontSize: 15, fontWeight: 500 }}>No patients match your filters.</p>
        </div>
      )}
    </div>
  );
}
