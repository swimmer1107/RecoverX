"use client";

import Link from "next/link";
import { ArrowRight, Clock3, Lock, PlayCircle, ShieldAlert, Upload } from "lucide-react";

type ExercisePose = "knee-flexion" | "straight-leg-raise" | "heel-slides" | "quad-sets" | "terminal-knee-extension";
type Difficulty = "Easy" | "Moderate" | "Hard";

type Exercise = {
  id: string;
  name: string;
  pose: ExercisePose;
  targetAngle: number;
  difficulty: Difficulty;
  inProgress?: boolean;
};

const hasUploadedReport = false;

const personalizedExercises: Exercise[] = [
  { id: "knee-flexion", name: "Knee Flexion", pose: "knee-flexion", targetAngle: 90, difficulty: "Moderate", inProgress: true },
  { id: "straight-leg-raise", name: "Straight Leg Raise", pose: "straight-leg-raise", targetAngle: 45, difficulty: "Easy" },
  { id: "heel-slides", name: "Heel Slides", pose: "heel-slides", targetAngle: 85, difficulty: "Easy" },
  { id: "quad-sets", name: "Quad Sets", pose: "quad-sets", targetAngle: 0, difficulty: "Easy" },
  { id: "terminal-knee-extension", name: "Terminal Knee Extension", pose: "terminal-knee-extension", targetAngle: 10, difficulty: "Hard" },
];

const genericExercises: Exercise[] = [
  { id: "aaos-heel-slides", name: "Heel Slides", pose: "heel-slides", targetAngle: 90, difficulty: "Easy" },
  { id: "aaos-quad-sets", name: "Quad Sets", pose: "quad-sets", targetAngle: 0, difficulty: "Easy" },
  { id: "aaos-straight-leg-raise", name: "Straight Leg Raise", pose: "straight-leg-raise", targetAngle: 45, difficulty: "Moderate" },
  { id: "aaos-knee-flexion", name: "Knee Flexion", pose: "knee-flexion", targetAngle: 90, difficulty: "Moderate" },
];

const difficultyDots: Record<Difficulty, string> = {
  Easy: "●",
  Moderate: "●●",
  Hard: "●●●",
};

function handleTilt(event: React.MouseEvent<HTMLElement>) {
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  card.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-4px)`;
}

function resetTilt(event: React.MouseEvent<HTMLElement>) {
  event.currentTarget.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) translateY(0)";
}

function PoseFigure({ pose }: { pose: ExercisePose }) {
  const common = {
    stroke: "var(--primary)",
    fill: "none",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg viewBox="0 0 180 116" aria-hidden="true" className="h-28 w-full">
      <path d="M18 94H162" stroke="rgba(127,179,211,0.24)" strokeWidth="1" strokeLinecap="round" />

      {pose === "knee-flexion" && (
        <>
          <circle cx="70" cy="31" r="8" {...common} />
          <path d="M69 40 C66 53 65 64 66 75" {...common} />
          <path d="M48 50 C60 49 73 50 84 56" {...common} />
          <path d="M66 75 L101 75 L122 94" {...common} />
          <path d="M66 75 L44 92" {...common} />
          <path d="M38 94 H128" {...common} />
        </>
      )}

      {pose === "straight-leg-raise" && (
        <>
          <circle cx="48" cy="62" r="8" {...common} />
          <path d="M56 67 C76 74 95 78 114 80" {...common} />
          <path d="M78 75 L58 91" {...common} />
          <path d="M112 80 L154 80" {...common} />
          <path d="M110 78 L143 42" {...common} />
          <path d="M153 80 L163 82" {...common} />
          <path d="M142 42 L153 36" {...common} />
        </>
      )}

      {pose === "heel-slides" && (
        <>
          <circle cx="45" cy="63" r="8" {...common} />
          <path d="M53 68 C73 76 92 81 111 82" {...common} />
          <path d="M76 76 L57 92" {...common} />
          <path d="M110 82 L136 70 L154 87" {...common} />
          <path d="M110 82 L150 82" {...common} />
          <path d="M143 70 C136 77 136 84 143 91" stroke="var(--accent)" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 4" />
          <path d="M153 87 H164" {...common} />
        </>
      )}

      {pose === "quad-sets" && (
        <>
          <circle cx="45" cy="63" r="8" {...common} />
          <path d="M53 68 C74 76 96 80 119 82" {...common} />
          <path d="M77 76 L58 92" {...common} />
          <path d="M118 82 H161" {...common} />
          <path d="M119 82 H76" {...common} />
          <path d="M106 72 L114 82 L106 92" stroke="var(--accent)" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}

      {pose === "terminal-knee-extension" && (
        <>
          <circle cx="83" cy="20" r="8" {...common} />
          <path d="M82 29 C80 45 80 58 83 70" {...common} />
          <path d="M62 42 C74 45 89 45 101 42" {...common} />
          <path d="M84 70 L70 93" {...common} />
          <path d="M84 70 L106 82 L118 100" {...common} />
          <path d="M68 94 H53" {...common} />
          <path d="M118 100 H132" {...common} />
          <path d="M105 82 C112 80 116 76 118 70" stroke="var(--accent)" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 4" />
        </>
      )}
    </svg>
  );
}

function ExerciseCard({ exercise, locked = false }: { exercise: Exercise; locked?: boolean }) {
  const actionText = exercise.inProgress ? "Resume" : "Start Session";

  return (
    <article
      onMouseMove={handleTilt}
      onMouseLeave={resetTilt}
      className="card group relative min-h-[330px] overflow-hidden p-5 transition-all duration-200 [transform-style:preserve-3d]"
    >
      <div className={locked ? "pointer-events-none select-none blur-sm" : ""}>
        <div className="mb-4 rounded-[var(--r-md)] border border-[var(--border)] bg-[rgba(14,165,233,0.04)] px-3 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <PoseFigure pose={exercise.pose} />
        </div>

        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <h2 className="font-display text-[18px] font-semibold text-[var(--text-1)]">{exercise.name}</h2>
          {exercise.inProgress && <span className="badge badge-amber">In progress</span>}
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          <span className="badge badge-blue">🎯 Target: {exercise.targetAngle}°</span>
          <span className="badge border border-[var(--border)] bg-[rgba(255,255,255,0.03)] text-[var(--text-2)]">
            <Clock3 className="h-3.5 w-3.5" /> ~10 minutes
          </span>
          <span className="badge border border-[var(--border)] bg-[rgba(255,255,255,0.03)] text-[var(--text-2)]">
            <span className="text-[var(--primary)]">{difficultyDots[exercise.difficulty]}</span> {exercise.difficulty}
          </span>
        </div>

        <Link href={`/session/${exercise.id}`} className="btn-primary inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-medium">
          {exercise.inProgress ? <PlayCircle className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          {actionText}
        </Link>
      </div>

      {locked && (
        <div className="overlay absolute inset-0 z-10 flex flex-col items-center justify-center bg-[rgba(255,255,255,0.68)] p-6 text-center backdrop-blur-md">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-bright)] bg-[var(--primary-dim)] text-[var(--primary)] shadow-[var(--shadow-glow-blue)]">
            <Lock className="h-5 w-5" />
          </div>
          <p className="mb-5 max-w-[280px] font-body text-sm leading-6 text-[var(--text-2)]">
            Upload your medical report to unlock your personalized exercises.
          </p>
          <Link href="/reports" className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-sm font-medium">
            <Upload className="h-4 w-4" />
            Upload Report →
          </Link>
        </div>
      )}
    </article>
  );
}

export default function ExerciseSelectionPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-8 md:px-8">
      <div className="space-grid" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 pb-12">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-data text-xs uppercase tracking-[0.22em] text-[var(--primary)]">Page 5 / Exercise Selection</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--text-1)] md:text-4xl">Choose today&apos;s session</h1>
          </div>
          {!hasUploadedReport && (
            <span className="badge badge-amber w-fit">
              <ShieldAlert className="h-3.5 w-3.5" />
              Report needed for personalization
            </span>
          )}
        </header>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {personalizedExercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} locked={!hasUploadedReport} />
          ))}
        </section>

        {!hasUploadedReport && (
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="font-display text-2xl font-semibold text-[var(--text-1)]">Standard Post-Surgery Exercises (AAOS defaults)</h2>
              <span className="badge badge-amber w-fit">⚠️ Upload your report for personalized angles</span>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {genericExercises.map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
