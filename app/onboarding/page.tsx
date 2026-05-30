"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, updateUser } from "../lib/auth";

const surgeryTypes = [
  "ACL Reconstruction",
  "Knee Replacement",
  "Hip Replacement",
  "Shoulder Surgery",
  "Spinal",
  "Other"
];

const sideTypes = ["Left", "Right", "Both"];

export default function OnboardingPage() {
  const router = useRouter();
  
  const [surgeryType, setSurgeryType] = useState<string>("");
  const [surgeryDate, setSurgeryDate] = useState<string>("");
  const [side, setSide] = useState<string>("");
  const [week, setWeek] = useState<number>(3);
  const [surgeon, setSurgeon] = useState("");
  const [hospital, setHospital] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push("/signup");
    } else if (user.role === "doctor") {
      router.push("/doctor/dashboard");
    } else {
      if (user.surgeryType) setSurgeryType(user.surgeryType);
      if (user.surgeryDate) setSurgeryDate(user.surgeryDate);
      if (user.side) setSide(user.side);
      if (user.week) setWeek(user.week);
      if (user.surgeon) setSurgeon(user.surgeon);
      if (user.hospital) setHospital(user.hospital);
      setLoading(false);
    }
  }, [router]);

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!surgeryType || !surgeryDate || !side) {
      alert("Please fill in the required fields");
      return;
    }
    
    // Save details to the localStorage profile
    updateUser({
      surgeryType,
      surgeryDate,
      side,
      week,
      surgeon,
      hospital
    });

    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-void)] flex items-center justify-center">
        <div className="text-xl text-[var(--text-2)] font-display">Loading profile setup...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-void)] flex flex-col items-center py-12 px-6">
      
      {/* Background styling to match theme */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(14,165,233,0.08), transparent 60%)' }} />

      <div className="w-full max-w-[640px] relative z-10">
        
        {/* Progress Pill */}
        <div className="flex justify-center mb-8">
          <div className="badge-blue">
            Step 2 of 2 — Your Recovery Profile
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display font-bold text-4xl text-[var(--text-1)] mb-4">Let&apos;s personalize your recovery</h1>
          <p className="font-body text-lg text-[var(--text-3)]">This helps AntiGravity build your exact exercise protocol.</p>
        </div>

        {/* Form Card */}
        <div className="card p-8 md:p-12 border border-[var(--border)]">
          <form onSubmit={handleComplete} className="space-y-10">
            
            {/* Surgery Type Selection */}
            <div>
              <label className="block font-display font-medium text-[var(--text-1)] mb-4">What type of surgery did you have?</label>
              <div className="flex flex-wrap gap-3">
                {surgeryTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSurgeryType(type)}
                    className={`px-5 py-2.5 rounded-full font-body text-sm transition-all ${
                      surgeryType === type 
                        ? 'bg-[var(--primary-dim)] border border-[var(--primary)] text-[var(--primary)] shadow-[0_0_10px_var(--primary-glow)]' 
                        : 'bg-[var(--bg-input)] border border-[var(--glass-border)] text-[var(--text-2)] hover:border-[var(--border-bright)]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Surgery Date */}
              <div>
                <label className="block font-display font-medium text-[var(--text-1)] mb-3">Surgery Date</label>
                <input 
                  type="date"
                  required
                  value={surgeryDate}
                  onChange={(e) => setSurgeryDate(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--glass-border)] text-[var(--text-1)] rounded-[var(--r-sm)] px-4 py-3.5 focus:outline-none focus:border-[var(--primary)] transition-all [color-scheme:dark]"
                />
              </div>

              {/* Side Selection */}
              <div>
                <label className="block font-display font-medium text-[var(--text-1)] mb-3">Which side?</label>
                <div className="flex gap-3">
                  {sideTypes.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSide(s)}
                      className={`flex-1 py-3.5 rounded-[var(--r-sm)] font-body text-sm transition-all ${
                        side === s 
                          ? 'bg-[var(--primary-dim)] border border-[var(--primary)] text-[var(--primary)] shadow-[0_0_10px_var(--primary-glow)]' 
                          : 'bg-[var(--bg-input)] border border-[var(--glass-border)] text-[var(--text-2)] hover:border-[var(--border-bright)]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recovery Week Range */}
            <div>
              <div className="flex justify-between items-end mb-4">
                <label className="block font-display font-medium text-[var(--text-1)]">Current Recovery Week</label>
                <span className="font-data text-sm text-[var(--primary)] bg-[var(--primary-dim)] px-3 py-1 rounded-full border border-[var(--border)]">
                  Week {week} of 16
                </span>
              </div>
              <input 
                type="range"
                min="1"
                max="16"
                value={week}
                onChange={(e) => setWeek(parseInt(e.target.value))}
                className="w-full h-2 bg-[var(--bg-elevated)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                style={{
                  background: `linear-gradient(to right, var(--primary) ${(week - 1) / 15 * 100}%, var(--bg-elevated) ${(week - 1) / 15 * 100}%)`
                }}
              />
            </div>

            <hr className="border-[var(--border)]" />

            {/* Optional Details */}
            <div className="space-y-6">
              <h3 className="font-display font-medium text-lg text-[var(--text-1)]">Optional Details</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-body text-sm text-[var(--text-2)] mb-2">Surgeon Name</label>
                  <input type="text" value={surgeon} onChange={(e) => setSurgeon(e.target.value)} placeholder="Dr. Sarah Chen" className="w-full bg-[var(--bg-input)] border border-[var(--glass-border)] text-[var(--text-1)] rounded-[var(--r-sm)] px-4 py-3 focus:border-[var(--primary)] outline-none" />
                </div>
                <div>
                  <label className="block font-body text-sm text-[var(--text-2)] mb-2">Hospital</label>
                  <input type="text" value={hospital} onChange={(e) => setHospital(e.target.value)} placeholder="Mount Sinai" className="w-full bg-[var(--bg-input)] border border-[var(--glass-border)] text-[var(--text-1)] rounded-[var(--r-sm)] px-4 py-3 focus:border-[var(--primary)] outline-none" />
                </div>
              </div>

              <div>
                <label className="block font-body text-sm text-[var(--text-2)] mb-2">Emergency Contact</label>
                <div className="grid md:grid-cols-2 gap-6">
                  <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Name (e.g. Jane Doe)" className="w-full bg-[var(--bg-input)] border border-[var(--glass-border)] text-[var(--text-1)] rounded-[var(--r-sm)] px-4 py-3 focus:border-[var(--primary)] outline-none" />
                  <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Phone Number" className="w-full bg-[var(--bg-input)] border border-[var(--glass-border)] text-[var(--text-1)] rounded-[var(--r-sm)] px-4 py-3 focus:border-[var(--primary)] outline-none" />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full btn-primary py-4 text-lg mt-8">
              Complete Setup
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
