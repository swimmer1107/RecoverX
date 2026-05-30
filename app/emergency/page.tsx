"use client";

import { useEffect, useState } from "react";
import { Phone, MapPin, Edit2, Check, Copy } from "lucide-react";
import { getSupabase, DEMO_USER } from "../lib/supabase";

// ── City lookup table ──────────────────────────────────────────────────────
const CITY_AMBULANCES: Record<string, { name: string; phone: string }[]> = {
  delhi: [
    { name: "Medanta", phone: "01244141414" },
    { name: "Fortis", phone: "01800001800" },
  ],
  mumbai: [
    { name: "Kokilaben", phone: "02242696969" },
    { name: "Hinduja", phone: "02224452222" },
  ],
  bangalore: [
    { name: "Manipal", phone: "08025024444" },
    { name: "Apollo", phone: "1066" },
  ],
  bengaluru: [
    { name: "Manipal", phone: "08025024444" },
    { name: "Apollo", phone: "1066" },
  ],
  hyderabad: [
    { name: "KIMS", phone: "04044885000" },
    { name: "Apollo", phone: "04023607777" },
  ],
  chennai: [
    { name: "Apollo", phone: "04428290200" },
    { name: "MIOT", phone: "04422490000" },
  ],
  kolkata: [
    { name: "AMRI", phone: "03366800000" },
    { name: "Fortis", phone: "03366284444" },
  ],
};

function getAmbulancesForCity(city: string) {
  const key = city.toLowerCase().trim();
  for (const [k, v] of Object.entries(CITY_AMBULANCES)) {
    if (key.includes(k)) return v;
  }
  return [
    { name: "National Ambulance", phone: "108" },
    { name: "Government Ambulance", phone: "102" },
  ];
}

// ── Big call button ────────────────────────────────────────────────────────
function CallButton({ emoji, label, number, href }: {
  emoji: string; label: string; number?: string; href: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      style={{
        display: "flex", alignItems: "center", gap: 14,
        background: "#fff", border: "1.5px solid #FFBEBE",
        borderRadius: "var(--r-xl)", padding: "18px 22px",
        boxShadow: "var(--shadow-card)", textDecoration: "none",
        minHeight: 64, transition: "all 0.18s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "var(--danger-light)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "var(--shadow-hover)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "#fff";
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "var(--shadow-card)";
      }}
    >
      <span style={{ fontSize: 26 }}>{emoji}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}>
          {label}
        </div>
        {number && (
          <div style={{ fontFamily: "var(--font-data)", fontSize: 20, fontWeight: 700, color: "var(--danger)" }}>
            {number}
          </div>
        )}
      </div>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        background: "var(--danger-light)", border: "1px solid #FFBEBE",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Phone style={{ width: 18, height: 18, color: "var(--danger)" }} />
      </div>
    </a>
  );
}

// ── Private ambulance card ─────────────────────────────────────────────────
function AmbulanceCard({ name, phone }: { name: string; phone: string }) {
  return (
    <a
      href={`tel:${phone}`}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#fff", border: "1px solid var(--border)",
        borderRadius: "var(--r-md)", padding: "14px 18px",
        textDecoration: "none", transition: "all 0.15s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "var(--danger-light)";
        e.currentTarget.style.borderColor = "#FFBEBE";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "#fff";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-1)" }}>{name}</div>
        <div style={{ fontFamily: "var(--font-data)", fontSize: 16, fontWeight: 700, color: "var(--danger)" }}>{phone}</div>
      </div>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        background: "var(--danger-light)", border: "1px solid #FFBEBE",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Phone style={{ width: 16, height: 16, color: "var(--danger)" }} />
      </div>
    </a>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid var(--border)",
      borderRadius: "var(--r-xl)", padding: "24px",
      boxShadow: "var(--shadow-card)",
    }}>
      <h3 style={{
        fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700,
        color: "var(--text-1)", marginBottom: 16,
      }}>{title}</h3>
      {children}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function EmergencyPage() {
  const [city, setCity] = useState<string>("");
  const [cityInput, setCityInput] = useState("");
  const [cityLoading, setCityLoading] = useState(true);

  // Emergency contact state
  const [savedContact, setSavedContact] = useState<{ name: string; phone: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [saving, setSaving] = useState(false);

  // Share location
  const [copied, setCopied] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Detect city from geolocation
  useEffect(() => {
    if (!navigator.geolocation) { setCityLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const detectedCity =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            "";
          setCity(detectedCity);
        } catch { /* ignore */ }
        setCityLoading(false);
      },
      () => setCityLoading(false),
      { timeout: 8000 }
    );
  }, []);

  // Load saved emergency contact from Supabase
  useEffect(() => {
    async function load() {
      const sb = getSupabase();
      if (!sb) return;
      const { data } = await sb
        .from("emergency_contacts")
        .select("name, phone")
        .eq("user_id", DEMO_USER)
        .single();
      if (data) {
        setSavedContact(data);
        setContactName(data.name);
        setContactPhone(data.phone);
      }
    }
    load();
  }, []);

  const activeCity = city || cityInput;
  const ambulances = getAmbulancesForCity(activeCity);

  async function saveContact() {
    if (!contactName.trim() || !contactPhone.trim()) return;
    setSaving(true);
    const sb = getSupabase();
    if (sb) {
      await sb.from("emergency_contacts").upsert(
        { user_id: DEMO_USER, name: contactName.trim(), phone: contactPhone.trim() },
        { onConflict: "user_id" }
      );
    }
    setSavedContact({ name: contactName.trim(), phone: contactPhone.trim() });
    setEditing(false);
    setSaving(false);
  }

  async function shareLocation() {
    let coords = userCoords;
    if (!coords) {
      try {
        coords = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
            reject,
            { timeout: 8000 }
          );
        });
        setUserCoords(coords);
      } catch { return; }
    }
    const link = `https://www.google.com/maps?q=${coords!.lat},${coords!.lng}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-3xl mx-auto flex flex-col gap-6 pb-12">
      {/* Red header bar */}
      <div style={{
        background: "linear-gradient(135deg, #D94040, #B02020)",
        borderRadius: "var(--r-xl)", padding: "24px 28px",
        boxShadow: "0 4px 24px rgba(217,64,64,0.30)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 28 }}>🚨</span>
          <h2 style={{
            fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800,
            color: "#fff", margin: 0,
          }}>Emergency</h2>
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.80)", margin: 0 }}>
          One-tap access to ambulance, police, and emergency contacts
        </p>
      </div>

      {/* Section 1 — One-tap calls */}
      <Section title="🚑 One-Tap Emergency Calls">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <CallButton emoji="🚑" label="National Ambulance" number="108" href="tel:108" />
          <CallButton emoji="🚑" label="CATS Ambulance (Delhi)" number="102" href="tel:102" />
          <CallButton emoji="🚔" label="Police" number="100" href="tel:100" />
          <CallButton
            emoji="🏥"
            label="Nearest Hospital"
            href="https://www.google.com/maps/search/hospital+near+me"
          />
        </div>
      </Section>

      {/* Section 2 — Private ambulances by city */}
      <Section title="🏙️ Private Ambulance — Your City">
        {cityLoading ? (
          <div className="skeleton" style={{ height: 16, width: "50%", marginBottom: 12 }} />
        ) : city ? (
          <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 12 }}>
            Showing results for <strong style={{ color: "var(--text-1)" }}>{city}</strong>
          </p>
        ) : (
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 8 }}>
              Could not detect city. Enter manually:
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="e.g. Delhi, Mumbai"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
              />
            </div>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ambulances.map((a) => (
            <AmbulanceCard key={a.phone} name={a.name} phone={a.phone} />
          ))}
        </div>
      </Section>

      {/* Section 3 — Personal emergency contact */}
      <Section title="👤 Personal Emergency Contact">
        {savedContact && !editing ? (
          <div>
            <div style={{
              background: "var(--danger-light)", border: "1px solid #FFBEBE",
              borderRadius: "var(--r-md)", padding: "16px 20px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 12,
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-1)", marginBottom: 2 }}>
                  {savedContact.name}
                </div>
                <div style={{ fontFamily: "var(--font-data)", fontSize: 18, fontWeight: 700, color: "var(--danger)" }}>
                  {savedContact.phone}
                </div>
              </div>
              <button
                onClick={() => setEditing(true)}
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  color: "var(--text-3)", padding: 8,
                }}
              >
                <Edit2 style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <a
              href={`tel:${savedContact.phone}`}
              className="btn-danger"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 8, width: "100%", padding: "14px", fontSize: 15,
                fontWeight: 700, textDecoration: "none", minHeight: 56,
                borderRadius: "var(--r-full)",
              }}
            >
              <Phone style={{ width: 18, height: 18 }} />
              Call Now — {savedContact.name}
            </a>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              type="text"
              placeholder="Contact name (e.g. Mom)"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn-primary"
                style={{ flex: 1, padding: "12px", fontSize: 14 }}
                onClick={saveContact}
                disabled={saving}
              >
                {saving ? "Saving..." : (
                  <><Check style={{ width: 15, height: 15 }} /> Save Contact</>
                )}
              </button>
              {savedContact && (
                <button
                  className="btn-ghost"
                  style={{ padding: "12px 20px", fontSize: 14 }}
                  onClick={() => { setEditing(false); setContactName(savedContact.name); setContactPhone(savedContact.phone); }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </Section>

      {/* Section 4 — Share location */}
      <Section title="📍 Quick Share Location">
        <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 14 }}>
          Share this link with emergency services or family
        </p>
        <button
          className="btn-primary"
          style={{ width: "100%", padding: "14px", fontSize: 15, gap: 8, minHeight: 56 }}
          onClick={shareLocation}
        >
          {copied ? (
            <><Check style={{ width: 18, height: 18 }} /> Copied!</>
          ) : (
            <><MapPin style={{ width: 18, height: 18 }} /> Share My Location</>
          )}
        </button>
        {copied && (
          <p style={{ fontSize: 12, color: "var(--accent)", textAlign: "center", marginTop: 8 }}>
            ✅ Google Maps link copied to clipboard
          </p>
        )}
      </Section>
    </div>
  );
}
