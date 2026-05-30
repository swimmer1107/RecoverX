"use client";

import { useEffect, useState, useRef } from "react";
import { MapPin, Phone, Navigation, Star, Search } from "lucide-react";

type Doctor = {
  id: string;
  name: string;
  specialty: "Physiotherapist" | "Orthopedic";
  distance: number;
  address: string;
  rating?: number;
  phone?: string;
  lat: number;
  lng: number;
};

type FilterType = "All" | "Physiotherapist" | "Orthopedic";

// ── Skeleton card ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "22px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      borderLeft: "4px solid #E2EAF4",
    }}>
      <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
        <div className="skeleton" style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 16, width: "65%", marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 12, width: "35%", borderRadius: 999 }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 12, width: "85%", marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 12, width: "40%", marginBottom: 18 }} />
      <div className="skeleton" style={{ height: 38, width: "100%", borderRadius: 999 }} />
    </div>
  );
}

// ── Doctor card ────────────────────────────────────────────────────────────
function DoctorCard({ doctor }: { doctor: Doctor }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doctor.name + " " + doctor.address)}`;
  const isPhysio = doctor.specialty === "Physiotherapist";
  const borderColor = isPhysio ? "var(--primary)" : "var(--accent)";
  const avatarBg = isPhysio ? "var(--primary-light)" : "var(--accent-light)";
  const avatarColor = isPhysio ? "var(--primary)" : "var(--accent-dark)";
  const initials = doctor.name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "⚕";
  const distColor = doctor.distance > 50 ? "var(--warn)" : "var(--primary)";

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "22px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        borderLeft: `4px solid ${borderColor}`,
        transition: "transform 0.2s, box-shadow 0.2s",
        display: "flex", flexDirection: "column", gap: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.13)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)";
      }}
    >
      {/* Top row: avatar + name + badge + rating */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
          background: avatarBg, color: avatarColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
        }}>
          {initials.length >= 2 ? initials : "⚕️"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
            color: "var(--text-1)", marginBottom: 5,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {doctor.name}
          </div>
          <span style={{
            display: "inline-block",
            padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
            background: isPhysio ? "var(--primary-light)" : "var(--accent-light)",
            color: isPhysio ? "var(--primary)" : "var(--accent-dark)",
            border: `1px solid ${isPhysio ? "var(--primary-mid)" : "rgba(14,168,116,0.25)"}`,
          }}>
            {isPhysio ? "🦴 Physiotherapist" : "⚕️ Orthopedic"}
          </span>
        </div>
        {doctor.rating && (
          <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
            <Star style={{ width: 13, height: 13, color: "var(--warn)", fill: "var(--warn)" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{doctor.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Address */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 6 }}>
        <MapPin style={{ width: 13, height: 13, color: "var(--text-3)", flexShrink: 0, marginTop: 2 }} />
        <span style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>{doctor.address}</span>
      </div>

      {/* Distance */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 16 }}>
        <span style={{ fontSize: 13 }}>📍</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: distColor }}>
          {doctor.distance.toFixed(1)} km away
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            background: "var(--primary)", color: "#fff",
            padding: "10px 16px", borderRadius: 999,
            fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13,
            textDecoration: "none", transition: "background 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#155fa0")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--primary)")}
        >
          <Navigation style={{ width: 14, height: 14 }} />
          Get Directions
        </a>
        {doctor.phone ? (
          <a
            href={`tel:${doctor.phone}`}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              background: "transparent", color: "var(--primary)",
              padding: "9px 16px", borderRadius: 999,
              border: "1px solid var(--primary-mid)",
              fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13,
              textDecoration: "none", transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--primary-light)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <Phone style={{ width: 14, height: 14 }} />
            Call
          </a>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            fontSize: 13, color: "var(--text-3)", padding: "9px 0",
          }}>
            <Phone style={{ width: 13, height: 13 }} />
            📞 Not available
          </div>
        )}
      </div>
    </div>
  );
}

// ── Unchanged logic functions ──────────────────────────────────────────────
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchDoctors(lat: number, lng: number): Promise<Doctor[]> {
  const queries = [
    { q: "physiotherapist", specialty: "Physiotherapist" as const },
    { q: "orthopedic doctor", specialty: "Orthopedic" as const },
  ];
  const results: Doctor[] = [];
  for (const { q, specialty } of queries) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&lat=${lat}&lon=${lng}&format=json&limit=6&addressdetails=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      const data = await res.json();
      for (const item of data) {
        const itemLat = parseFloat(item.lat);
        const itemLng = parseFloat(item.lon);
        const dist = haversineKm(lat, lng, itemLat, itemLng);
        results.push({
          id: item.place_id,
          name: item.display_name.split(",")[0],
          specialty,
          distance: dist,
          address: item.display_name.split(",").slice(1, 4).join(",").trim(),
          lat: itemLat,
          lng: itemLng,
          rating: undefined,
          phone: undefined,
        });
      }
    } catch {
      // ignore per-query failures
    }
  }
  return results.sort((a, b) => a.distance - b.distance);
}

async function geocodeCity(city: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    const data = await res.json();
    if (data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch { /* ignore */ }
  return null;
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function FindDoctorsPage() {
  const [locationState, setLocationState] = useState<"detecting" | "denied" | "ready" | "error">("detecting");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>("All");
  const [manualCity, setManualCity] = useState("");
  const [apiError, setApiError] = useState(false);
  const [cityName, setCityName] = useState<string>("");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  // Detect location on mount
  useEffect(() => {
    if (!navigator.geolocation) { setLocationState("denied"); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationState("ready");
        // Reverse geocode for display name
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "";
          const state = data.address?.state || "";
          if (city) setCityName([city, state].filter(Boolean).join(", "));
        } catch { /* ignore */ }
      },
      () => setLocationState("denied"),
      { timeout: 10000 }
    );
  }, []);

  // Fetch doctors when coords are ready
  useEffect(() => {
    if (!coords) return;
    setLoading(true);
    setApiError(false);
    fetchDoctors(coords.lat, coords.lng)
      .then((data) => { setDoctors(data); setLoading(false); })
      .catch(() => { setApiError(true); setLoading(false); });
  }, [coords]);

  // Init Leaflet map
  useEffect(() => {
    if (!coords || !mapRef.current || typeof window === "undefined") return;
    if (mapInstanceRef.current) return;
    import("leaflet").then((L) => {
      if (!mapRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      const map = L.map(mapRef.current!).setView([coords.lat, coords.lng], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
      L.circleMarker([coords.lat, coords.lng], {
        radius: 8, color: "#1A6EBD", fillColor: "#1A6EBD", fillOpacity: 1,
      }).addTo(map).bindPopup("You are here");
      mapInstanceRef.current = map;
    });
  }, [coords]);

  // Add doctor pins to map
  useEffect(() => {
    if (!mapInstanceRef.current || doctors.length === 0) return;
    import("leaflet").then((L) => {
      const map = mapInstanceRef.current as ReturnType<typeof L.map>;
      doctors.forEach((doc) => {
        L.marker([doc.lat, doc.lng])
          .addTo(map)
          .bindPopup(`<b>${doc.name}</b><br/>${doc.specialty}<br/>${doc.distance.toFixed(1)} km`);
      });
    });
  }, [doctors]);

  const handleManualSearch = async () => {
    if (!manualCity.trim()) return;
    setLoading(true);
    setApiError(false);
    const geo = await geocodeCity(manualCity);
    if (!geo) { setApiError(true); setLoading(false); return; }
    setCityName(manualCity.trim());
    setCoords(geo);
    setLocationState("ready");
  };

  const filtered = filter === "All" ? doctors : doctors.filter((d) => d.specialty === filter);

  const filterConfig: { key: FilterType; icon: string; label: string }[] = [
    { key: "All", icon: "🔍", label: "All" },
    { key: "Physiotherapist", icon: "🦴", label: "Physiotherapist" },
    { key: "Orthopedic", icon: "⚕️", label: "Orthopedic" },
  ];

  return (
    <div className="animate-in fade-in duration-500 pb-12" style={{ maxWidth: 1200, margin: "0 auto" }}>

      {/* ── HERO HEADER ── */}
      <div style={{
        background: "linear-gradient(135deg, var(--primary-light) 0%, #E8F4FF 100%)",
        border: "1px solid var(--primary-mid)",
        borderRadius: 20, padding: "28px 32px", marginBottom: 24,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 28 }}>🏥</span>
              <h2 style={{
                fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 800,
                color: "var(--text-1)", margin: 0, letterSpacing: "-0.4px",
              }}>
                Find Nearby Doctors
              </h2>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-2)", margin: 0 }}>
              Physiotherapists and orthopedic specialists near you
            </p>
          </div>

          {/* Location pill badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "7px 16px", borderRadius: 999,
            background: "#fff", border: "1px solid var(--primary-mid)",
            fontSize: 13, fontWeight: 600,
            color: locationState === "detecting" ? "var(--text-3)" : "var(--primary)",
            boxShadow: "0 1px 6px rgba(26,110,189,0.10)",
          }}>
            {locationState === "detecting" ? (
              <>
                <div className="skeleton" style={{ width: 10, height: 10, borderRadius: "50%" }} />
                📍 Detecting your location...
              </>
            ) : cityName ? (
              <>📍 {cityName}</>
            ) : (
              <>📍 Location ready</>
            )}
          </div>
        </div>

        {/* Location denied — manual search */}
        {locationState === "denied" && (
          <div style={{
            marginTop: 16,
            background: "var(--warn-light)", border: "1px solid #FFD59E",
            borderRadius: 12, padding: "14px 18px",
          }}>
            <p style={{ fontSize: 13, color: "var(--warn)", marginBottom: 10 }}>
              ⚠️ Location access denied. Enter your city or pincode to search.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="text"
                placeholder="e.g. Delhi, Mumbai, 400001"
                value={manualCity}
                onChange={(e) => setManualCity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                style={{ flex: 1 }}
              />
              <button className="btn-primary" style={{ padding: "11px 20px", fontSize: 13, borderRadius: "var(--r-md)" }} onClick={handleManualSearch}>
                <Search style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* API error */}
      {apiError && (
        <div style={{
          background: "var(--danger-light)", border: "1px solid #FFBEBE",
          borderRadius: 12, padding: "14px 20px",
          fontSize: 13, color: "var(--danger)", marginBottom: 20,
        }}>
          🚨 Could not load results. Please try again.
        </div>
      )}

      {/* ── MAP ── */}
      {coords && (
        <div style={{ marginBottom: 8 }}>
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <p style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
            Your area
          </p>
          <div style={{
            borderRadius: 16, overflow: "hidden",
            boxShadow: "0 4px 20px rgba(26,110,189,0.12), 0 1px 4px rgba(0,0,0,0.06)",
            border: "1px solid var(--border)",
            height: 380,
          }}>
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
          </div>
        </div>
      )}

      {/* ── DIVIDER ── */}
      {(locationState === "ready" || doctors.length > 0) && (
        <div style={{ height: 1, background: "var(--border)", margin: "24px 0" }} />
      )}

      {/* ── FILTERS + COUNT ── */}
      {(locationState === "ready" || doctors.length > 0) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {filterConfig.map(({ key, icon, label }) => {
              const active = filter === key;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  style={{
                    padding: "8px 18px", borderRadius: 999,
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                    border: `1.5px solid ${active ? "var(--primary)" : "var(--primary-mid)"}`,
                    background: active ? "var(--primary)" : "#fff",
                    color: active ? "#fff" : "var(--primary)",
                    boxShadow: active ? "0 2px 8px rgba(26,110,189,0.25)" : "none",
                    transition: "all 0.15s",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  <span>{icon}</span>
                  {label}
                </button>
              );
            })}
          </div>
          {!loading && (
            <span style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 500 }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} found
            </span>
          )}
        </div>
      )}

      {/* ── LOADING SKELETONS ── */}
      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!loading && !apiError && locationState === "ready" && filtered.length === 0 && (
        <div style={{
          background: "#fff", border: "1px solid var(--border)",
          borderRadius: 16, padding: "56px 40px",
          textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--text-1)", marginBottom: 8 }}>
            No doctors found nearby
          </div>
          <div style={{ fontSize: 14, color: "var(--text-3)" }}>
            Try searching by city name using the search box above.
          </div>
        </div>
      )}

      {/* ── RESULTS GRID ── */}
      {!loading && filtered.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20,
        }}>
          {filtered.map((doc) => <DoctorCard key={doc.id} doctor={doc} />)}
        </div>
      )}
    </div>
  );
}
