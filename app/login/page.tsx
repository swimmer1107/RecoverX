"use client";

import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowRight, Quote, Stethoscope, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { saveUser } from "../lib/auth";

const HeroScene = dynamic(() => import("../components/HeroScene"), { ssr: false });

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError(null);

    // Derive a display name from the email if no name stored
    const derivedName = name.trim() || email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());

    // Save login session to localStorage
    saveUser({
      id: `user-${email.replace(/\W/g, "")}`,
      name: derivedName,
      email: email.trim(),
      role,
      week: 1,
    });

    // Role-based redirect
    if (role === "doctor") {
      router.push("/doctor/dashboard");
    } else {
      router.push("/dashboard");
    }
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
            &quot;The skeleton overlay showed me I was doing my knee bends completely wrong. RecoverX caught it on the first rep.&quot;
          </p>
          <div className="font-display text-sm text-[var(--text-3)]">— A.M., ACL Reconstruction</div>
        </div>
      </div>

      {/* RIGHT PANEL (60%) */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-24 relative z-10">

        <div className="lg:hidden flex items-center gap-1 mb-16">
          <Link href="/" className="inline-flex items-center gap-1 cursor-pointer">
            <span className="font-display font-bold text-2xl tracking-tight bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
              RecoverX
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="font-display font-bold text-4xl text-[var(--text-1)] mb-3">Welcome back</h1>
            <p className="font-body text-[var(--text-3)]">Continue your journey</p>
          </div>

          {/* ── Role Selector ── */}
          <div className="mb-6">
            <label className="block font-body text-sm text-[var(--text-2)] mb-3">Signing in as…</label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: "patient", label: "Patient", icon: UserRound },
                { value: "doctor", label: "Doctor", icon: Stethoscope },
              ] as const).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "var(--r-md)",
                    border: `2px solid ${role === value ? (value === "doctor" ? "var(--secondary)" : "var(--primary)") : "var(--border)"}`,
                    background: role === value
                      ? (value === "doctor" ? "var(--secondary-light)" : "var(--primary-light)")
                      : "var(--bg-input)",
                    cursor: "pointer",
                    transition: "all 0.18s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Icon
                    style={{
                      width: 16, height: 16,
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
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Name field (so we can personalize the greeting) */}
            <div>
              <label className="block font-body text-sm text-[var(--text-2)] mb-2">Your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === "doctor" ? "Dr. Your Name" : "Your full name"}
                className="w-full bg-[var(--bg-input)] border border-[var(--glass-border)] text-[var(--text-1)] rounded-[var(--r-sm)] px-4 py-3.5 focus:outline-none focus:border-[var(--primary)] transition-all"
              />
            </div>

            <div>
              <label className="block font-body text-sm text-[var(--text-2)] mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === "doctor" ? "doctor@hospital.com" : "patient@example.com"}
                className={`w-full bg-[var(--bg-input)] border ${error && !email ? "border-[var(--danger)]" : "border-[var(--glass-border)]"} text-[var(--text-1)] rounded-[var(--r-sm)] px-4 py-3.5 focus:outline-none focus:border-[var(--primary)] transition-all`}
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block font-body text-sm text-[var(--text-2)]">Password</label>
                <Link href="#" className="font-body text-sm text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors">Forgot password?</Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-[var(--bg-input)] border ${error && !password ? "border-[var(--danger)]" : "border-[var(--glass-border)]"} text-[var(--text-1)] rounded-[var(--r-sm)] px-4 py-3.5 focus:outline-none focus:border-[var(--primary)] transition-all`}
              />
              {error && (
                <p className="text-[var(--danger)] text-xs mt-2 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-[var(--danger)]" /> {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full btn-primary flex justify-center py-4"
              style={role === "doctor" ? { background: "var(--secondary)" } : {}}
            >
              Sign In as {role === "doctor" ? "Doctor" : "Patient"}
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-[1px] bg-[var(--border)]" />
            <span className="font-data text-xs text-[var(--text-3)]">OR</span>
            <div className="flex-1 h-[1px] bg-[var(--border)]" />
          </div>

          <button className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 rounded-[var(--r-sm)] px-4 py-3.5 font-display font-medium hover:bg-slate-100 transition-colors shadow-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          <p className="text-center font-body text-sm text-[var(--text-3)] mt-10">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[var(--text-1)] font-medium hover:text-[var(--primary)] transition-colors">
              Start free <ArrowRight className="inline w-3 h-3" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
