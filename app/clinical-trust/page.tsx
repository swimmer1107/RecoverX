import Link from "next/link";
import { Brain, Database, FileCheck2, Microscope, ShieldCheck, Stethoscope } from "lucide-react";

const references = [
  {
    label: "BlazePose: On-device Real-time Body Pose Tracking",
    href: "https://arxiv.org/abs/2006.10204",
  },
  {
    label: "Assessment of monocular human pose estimation models for clinical movement analysis",
    href: "https://www.nature.com/articles/s41598-025-22626-7",
  },
  {
    label: "AAOS Clinical Practice Guideline: Management of Anterior Cruciate Ligament Injuries",
    href: "https://www.aaos.org/quality/quality-programs/anterior-cruciate-ligament-injuries/",
  },
  {
    label: "AAOS Updates Guideline for Management of ACL Injuries",
    href: "https://www.aaos.org/aaos-home/newsroom/press-releases/aaos-updates-guideline-for-management-of-acl-injuries/",
  },
  {
    label: "Supabase Security Documentation",
    href: "https://supabase.com/docs/guides/security",
  },
  {
    label: "Supabase Data Processing Addendum",
    href: "https://supabase.com/downloads/docs/Supabase%2BDPA%2B231211.pdf",
  },
];

export default function ClinicalTrustPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-10 md:px-8">
      <div className="space-grid" />
      <div className="relative z-10 mx-auto max-w-6xl pb-14">
        <section className="mb-10 max-w-3xl">
          <p className="font-data text-xs uppercase tracking-[0.22em] text-[var(--primary)]">Page 13 / Clinical Trust</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-[var(--text-1)] md:text-6xl">The science behind AntiGravity</h1>
          <p className="mt-5 text-lg leading-8 text-[var(--text-2)]">
            RecoverX is designed as a recovery support layer: computer vision for movement tracking, guideline-aware exercise defaults, and transparent AI coaching.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <TrustSection
            icon={Microscope}
            title="How We Measure"
            body="We use MediaPipe BlazePose-style tracking to estimate body position from a webcam. The model family predicts 33 body landmarks and can run in real time on consumer devices. Validation varies by exercise, camera angle, and lighting; some studies report strong correlations up to r=0.97, while clinical movement papers also show meaningful error ranges. AntiGravity treats angles as coaching support, not a replacement for a clinician’s goniometer."
            link={{ href: "https://arxiv.org/abs/2006.10204", label: "Read the BlazePose paper" }}
          />
          <TrustSection
            icon={FileCheck2}
            title="Clinical Guidelines"
            body="Generic defaults are based on conservative post-surgery rehabilitation patterns and AAOS clinical practice guidance where applicable, including the 2022 ACL guideline update. Personalized targets should come from the patient’s uploaded report and physiotherapist instructions."
            link={{ href: "https://www.aaos.org/quality/quality-programs/anterior-cruciate-ligament-injuries/", label: "AAOS guideline resources" }}
          />
          <TrustSection
            icon={Brain}
            title="AI Transparency"
            body="Gemini helps summarize reports, generate short coaching prompts, and answer recovery questions. It does not diagnose, invent new exercises, override red flags, or decide whether a patient is medically cleared for activity."
          />
          <TrustSection
            icon={Database}
            title="Data & Privacy"
            body="The app is structured for Supabase-backed storage with row-level access controls, TLS-protected transport, and platform compliance controls. Users can download or delete their data from Settings. AntiGravity does not sell recovery data."
            link={{ href: "https://supabase.com/docs/guides/security", label: "Supabase security docs" }}
          />
        </div>

        <section className="card mt-6 border-[rgba(239,68,68,0.24)] bg-[rgba(239,68,68,0.05)] p-6">
          <div className="flex gap-4">
            <Stethoscope className="h-8 w-8 shrink-0 text-[var(--danger)]" />
            <div>
              <h2 className="font-display text-2xl font-semibold text-[var(--text-1)]">What We Are Not</h2>
              <p className="mt-3 leading-7 text-[var(--text-2)]">
                RecoverX is not a diagnostic tool, not FDA-approved, and not a replacement for physiotherapy. It should support the plan your licensed clinician already gave you.
              </p>
            </div>
          </div>
        </section>

        <section className="card mt-6 p-6">
          <div className="mb-4 flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-[var(--accent)]" />
            <h2 className="font-display text-2xl font-semibold text-[var(--text-1)]">References</h2>
          </div>
          <ol className="list-decimal space-y-3 pl-5 text-sm text-[var(--text-2)]">
            {references.map((reference) => (
              <li key={reference.href}>
                <Link href={reference.href} className="text-[var(--primary)] hover:text-[var(--primary-dark)]">
                  {reference.label}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}

function TrustSection({ icon: Icon, title, body, link }: { icon: typeof Microscope; title: string; body: string; link?: { href: string; label: string } }) {
  return (
    <section className="card p-6">
      <Icon className="mb-4 h-8 w-8 text-[var(--primary)]" />
      <h2 className="font-display text-2xl font-semibold text-[var(--text-1)]">{title}</h2>
      <p className="mt-3 leading-7 text-[var(--text-2)]">{body}</p>
      {link && (
        <Link href={link.href} className="mt-4 inline-flex text-sm text-[var(--primary)] hover:text-[var(--primary-dark)]">
          {link.label} →
        </Link>
      )}
    </section>
  );
}
