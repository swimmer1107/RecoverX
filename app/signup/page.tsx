"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Quote, Stethoscope, UserRound } from "lucide-react";
import { saveUser } from "../lib/auth";

const HeroScene = dynamic(() => import("../components/HeroScene"), { ssr: false });

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    let s = 0;
    if (password.length > 5) s += 1;
    if (password.length > 8) s += 1;
    if (/[A-Z]/.test(password)) s += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) s += 1;
    setStrength(s);
  }, [password]);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (!agreed) {
      alert("Please agree to the medical disclaimer");
      return;
    }

    // Save the new user to localStorage
    saveUser({
      id: `user-${Date.now()}`,
      name: fullName.trim() || (role === "doctor" ? "Dr. New User" : "New User"),
      email: email.trim(),
      role,
      week: 1,
    });

    // Role-based redirect
    if (role === "doctor") {
      router.push("/doctor/dashboard");
    } else {
      router.push("/onboarding");
    }
  };

  const getStrengthColor = (index: number) => {
    if (index >= strength) return "bg-[var(--bg-input)] border border-[var(--border)]";
    if (strength === 1) return "bg-[var(--danger)] shadow-[0_0_10px_var(--danger-glow)]";
    if (strength === 2) return "bg-[var(--warn)] shadow-[0_0_10px_rgba(232,147,10,0.2)]";
    if (strength === 3) return "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.2)]";
    return "bg-[var(--accent)] shadow-[0_0_10px_var(--accent-glow)]";
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg-void)] overflow-hidden">

      {/* LEFT PANEL (40%) */}
      <div
        className="hidden lg:flex w-[40%] flex-col relative border-r border-[var(--border)]"
        style={{ background: "radial-gradient(circle at 30% 50%, rgba(14,165,233,0.15), transparent 60%)" }}
      >
        <div className="p-12 relative z-20">
          <Link href="/" className="inline-flex items-center gap-1 cursor-pointer">
            <span className="font-display font-bold text-2xl tracking-tight bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
              RecoverX
            </span>
            
          </Link>
          <p className="font-display text-xl text-[var(--text-1)] mt-4 opacity-90">Defy recovery.</p>
        </div>

        <div className="flex-1 relative w-full flex items-center justify-center -mt-12 opacity-80 pointer-events-none">
          <div className="w-[120%] h-[120%] absolute">
            <HeroScene />
          </div>
        </div>

        <div className="p-12 relative z-20 mt-auto">
          <Quote className="w-8 h-8 text-[var(--primary-dim)] mb-4" />
          <p className="font-body italic text-[15px] text-[var(--text-2)] mb-4">
            &quot;Having a voice tell me exactly how many degrees to adjust is something no printed sheet of exercises can do.&quot;
          </p>
          <div className="font-display text-sm text-[var(--text-3)]">— Priya S., Knee Replacement</div>
        </div>
      </div>

      {/* RIGHT PANEL (60%) */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-24 relative z-10 overflow-y-auto">
        <div className="w-full max-w-md mx-auto py-12">
          <div className="mb-10">
            <h1 className="font-display font-bold text-4xl text-[var(--text-1)] mb-3">Create Account</h1>
            <p className="font-body text-[var(--text-3)]">Step 1 of 2: Choose your role and set up access</p>
          </div>

          {/* ── Role Selector ── */}
          <div className="mb-6">
            <label className="block font-body text-sm text-[var(--text-2)] mb-3">I am a…</label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: "patient", label: "Patient", icon: UserRound, desc: "Recovering from surgery" },
                { value: "doctor", label: "Doctor", icon: Stethoscope, desc: "Managing patient rehab" },
              ] as const).map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  style={{
                    padding: "16px 14px",
                    borderRadius: "var(--r-md)",
                    border: `2px solid ${role === value ? (value === "doctor" ? "var(--secondary)" : "var(--primary)") : "var(--border)"}`,
                    background: role === value
                      ? (value === "doctor" ? "var(--secondary-light)" : "var(--primary-light)")
                      : "var(--bg-input)",
                    cursor: "pointer",
                    transition: "all 0.18s",
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Icon
                      style={{
                        width: 18, height: 18,
                        color: role === value
                          ? (value === "doctor" ? "var(--secondary)" : "var(--primary)")
                          : "var(--text-3)",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700, fontSize: 14,
                        color: role === value
                          ? (value === "doctor" ? "var(--secondary)" : "var(--primary)")
                          : "var(--text-2)",
                      }}
                    >
                      {label}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-3)" }}>{desc}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block font-body text-sm text-[var(--text-2)] mb-2">Full name</label>
              <input
                type="text" required
                value={fullName} onChange={(e) => setFullName(e.target.value)}
                placeholder={role === "doctor" ? "Dr. Your Name" : "Your full name"}
                className="w-full bg-[var(--bg-input)] border border-[var(--glass-border)] text-[var(--text-1)] rounded-[var(--r-sm)] px-4 py-3.5 focus:outline-none focus:border-[var(--primary)] transition-all"
              />
            </div>

            <div>
              <label className="block font-body text-sm text-[var(--text-2)] mb-2">Email address</label>
              <input
                type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder={role === "doctor" ? "doctor@hospital.com" : "patient@example.com"}
                className="w-full bg-[var(--bg-input)] border border-[var(--glass-border)] text-[var(--text-1)] rounded-[var(--r-sm)] px-4 py-3.5 focus:outline-none focus:border-[var(--primary)] transition-all"
              />
            </div>

            <div>
              <label className="block font-body text-sm text-[var(--text-2)] mb-2">Password</label>
              <input
                type="password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--bg-input)] border border-[var(--glass-border)] text-[var(--text-1)] rounded-[var(--r-sm)] px-4 py-3.5 focus:outline-none focus:border-[var(--primary)] transition-all"
              />
              <div className="flex gap-2 mt-3">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${getStrengthColor(index)}`} />
                ))}
              </div>
            </div>

            <div>
              <label className="block font-body text-sm text-[var(--text-2)] mb-2">Confirm Password</label>
              <input
                type="password" required
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-[var(--bg-input)] border ${confirmPassword && password !== confirmPassword ? "border-[var(--danger)]" : "border-[var(--glass-border)]"} text-[var(--text-1)] rounded-[var(--r-sm)] px-4 py-3.5 focus:outline-none focus:border-[var(--primary)] transition-all`}
              />
            </div>

            <div className="flex items-start gap-3 py-4">
              <input
                type="checkbox" required
                checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-input)] accent-[var(--primary)]"
              />
              <label className="font-body text-xs text-[var(--text-3)] leading-relaxed">
                {role === "doctor"
                  ? "I confirm I am a licensed medical professional and agree to the Terms of Service."
                  : "I understand AntiGravity supports, but does not replace, my licensed physiotherapist. I have read the Terms of Service."}
              </label>
            </div>

            <button
              type="submit"
              className="w-full btn-primary flex justify-center py-4 text-base"
              style={role === "doctor" ? { background: "var(--secondary)" } : {}}
            >
              {role === "doctor" ? "Create Doctor Account →" : "Create Account →"}
            </button>
          </form>

          <p className="text-center font-body text-sm text-[var(--text-3)] mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--text-1)] font-medium hover:text-[var(--primary)] transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
