"use client";

import {
  CheckCircle2,
  FileSearch,
  FileText,
  Loader2,
  ShieldCheck,
  Target,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

type TailorResponse = {
  tailoredResume: string;
  changeNotes: string[];
};

type ErrorResponse = {
  message?: string;
};

const exampleResume = `Pranav Sawant

Experience
- Built BuildNest, an opportunity board for student developers using Next.js, Tailwind CSS, Supabase, PostgreSQL, and Vercel.
- Added search and filtering for opportunities and created detail pages with external links.
- Worked on Aaspas, a hyperlocal community app with locality onboarding, local posts, groups, and business discovery.

Education
- BSc IT 2nd Year Student, Maharashtra`;

const exampleJobDescription =
  "We are hiring a Web Developer Intern with experience in React, Next.js, Tailwind CSS, frontend development, database integration, and deploying projects. The candidate should be able to build clean UI, work with APIs, and create practical web applications.";

function stripResumeMarkdownSyntax(text: string) {
  return text
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/#/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/__/g, "");
}

const heroBadges = [
  "No fake skills",
  "Change notes included",
  "Built for job seekers",
];

const trustStrip = [
  "No fake skills invented",
  "Change notes for every edit",
  "Built for serious job seekers",
];

const howItWorks = [
  {
    icon: FileText,
    title: "Paste your resume",
    body: "Start with the experience you already have, from projects to education.",
  },
  {
    icon: Target,
    title: "Add the job description",
    body: "Tailor Fit reads the role requirements, keywords, and priorities.",
  },
  {
    icon: CheckCircle2,
    title: "Get an honest tailored version",
    body: "Receive a rewritten resume plus notes explaining each important change.",
  },
];

const differentiators = [
  {
    icon: ShieldCheck,
    title: "Does not invent experience",
    body: "The prompt is designed to preserve facts and avoid unsupported skills.",
  },
  {
    icon: FileSearch,
    title: "Explains what changed",
    body: "Change notes show how the rewrite maps to the job description.",
  },
  {
    icon: Zap,
    title: "Helps you tailor faster",
    body: "Use the example, paste your own text, and iterate quickly before applying.",
  },
];

export default function Home() {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tailoredResume, setTailoredResume] = useState("");
  const [changeNotes, setChangeNotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isExampleDemo, setIsExampleDemo] = useState(false);

  const canSubmit = resume.trim().length > 0 && jobDescription.trim().length > 0;

  useEffect(() => {
    function updateScrollProgress() {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (scrollableHeight <= 0) {
        setScrollProgress(0);
        return;
      }

      setScrollProgress(
        Math.min(100, Math.max(0, (window.scrollY / scrollableHeight) * 100)),
      );
    }

    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);

    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, []);

  function resetOutputState() {
    setTailoredResume("");
    setChangeNotes([]);
    setError("");
    setCopied(false);
  }

  async function handleSubmit() {
    if (!canSubmit || loading) {
      return;
    }

    const trimmedResume = resume.trim();
    const trimmedJobDescription = jobDescription.trim();

    if (trimmedResume.length < 50) {
      resetOutputState();
      setError("Resume must be at least 50 characters.");
      return;
    }

    if (trimmedJobDescription.length < 50) {
      resetOutputState();
      setError("Job description must be at least 50 characters.");
      return;
    }

    setLoading(true);
    resetOutputState();

    try {
      const response = await fetch("/api/tailor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume: trimmedResume,
          jobDescription: trimmedJobDescription,
          isExampleDemo,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | ErrorResponse
          | null;

        if (response.status === 400) {
          setError(data?.message || "Please check your resume and job description.");
          return;
        }

        setError(
          data?.message ||
            "We could not tailor your resume right now. Please try again shortly.",
        );
        return;
      }

      const data = (await response.json()) as TailorResponse;
      setTailoredResume(stripResumeMarkdownSyntax(data.tailoredResume));
      setChangeNotes(data.changeNotes);
    } catch {
      setError(
        "We could not tailor your resume right now. Please try again shortly.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!tailoredResume) {
      return;
    }

    try {
      await navigator.clipboard.writeText(tailoredResume);
      setCopied(true);
      setShowCopyToast(true);
      window.setTimeout(() => {
        setCopied(false);
        setShowCopyToast(false);
      }, 1800);
    } catch {
      setError("Copy failed. Please select and copy the tailored resume text.");
    }
  }

  function handleClear() {
    setResume("");
    setJobDescription("");
    setIsExampleDemo(false);
    resetOutputState();
  }

  function handleTryExample() {
    setResume(exampleResume);
    setJobDescription(exampleJobDescription);
    setIsExampleDemo(true);
    resetOutputState();
  }

  function handleResumeChange(value: string) {
    setResume(value);
    setIsExampleDemo(false);
  }

  function handleJobDescriptionChange(value: string) {
    setJobDescription(value);
    setIsExampleDemo(false);
  }

  function handleTryAgain() {
    void handleSubmit();
  }

  return (
    <main className="min-h-screen bg-[#fbf6ea] text-[#15140f]">
      <div className="fixed inset-x-0 top-0 z-50 h-0.5 bg-[#e8dfcf]">
        <div
          className="h-full bg-emerald-400 transition-[width] duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {showCopyToast ? (
        <div
          className="fixed right-4 top-20 z-50 rounded-md border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 shadow-lg shadow-slate-900/10"
          role="status"
        >
          Tailored resume copied.
        </div>
      ) : null}

      <nav className="sticky top-0 z-40 border-b border-[#e8dfcf]/90 bg-[#fbf6ea]/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-4">
          <a className="flex items-center gap-3" href="#">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[#15140f] text-sm font-semibold tracking-tight text-emerald-200 shadow-sm">
              TF
            </span>
            <span className="text-base font-semibold tracking-tight text-[#15140f]">
              Tailor Fit
            </span>
          </a>

          <div className="flex items-center gap-2">
            <a
              className="lift-on-hover rounded-md px-3 py-2 text-sm font-semibold text-[#6b665d] hover:bg-white hover:text-[#15140f]"
              href="#demo"
            >
              Demo
            </a>
            <a
              className="lift-on-hover rounded-md border border-[#d9cfbd] bg-white/80 px-3 py-2 text-sm font-semibold text-[#15140f] shadow-sm hover:border-emerald-300 hover:text-emerald-800"
              href="https://github.com/ItzPranav61/Tailor-fit"
              rel="noreferrer"
              target="_blank"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>

      <section className="px-4 pb-8 pt-14 sm:px-6 sm:pb-12 sm:pt-20 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.8fr)] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
              Honest resume tailoring
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.04] tracking-normal text-[#15140f] sm:text-6xl lg:text-7xl">
              Tailor your resume to any job description — without faking
              experience.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6b665d]">
              Paste your resume and a job description. Tailor Fit rewrites your
              resume to match the role, explains what changed, and keeps your
              experience honest.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {heroBadges.map((badge) => (
                <span
                  className="rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm shadow-slate-900/5"
                  key={badge}
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="lift-on-hover inline-flex min-h-12 items-center justify-center rounded-md bg-[#15140f] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
                href="#demo"
              >
                Try Demo
              </a>
              <a
                className="lift-on-hover inline-flex min-h-12 items-center justify-center rounded-md border border-[#d9cfbd] bg-white/80 px-6 py-3 text-sm font-semibold text-[#15140f] shadow-sm hover:border-emerald-300 hover:text-emerald-800"
                href="https://github.com/ItzPranav61/Tailor-fit"
                rel="noreferrer"
                target="_blank"
              >
                View GitHub
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-[#e3d8c5] bg-[#fffdf8] p-5 shadow-2xl shadow-[#c8bda8]/25">
            <div className="flex items-center justify-between border-b border-[#ebe3d6] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Live workflow
                </p>
                <p className="mt-1 text-sm font-semibold text-[#15140f]">
                  Resume rewrite preview
                </p>
              </div>
              <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                Honest rewrite
              </span>
            </div>
            <div className="mt-5 space-y-3">
              <div className="hero-original rounded-md border border-[#e3d8c5] bg-[#f6efe2] p-4">
                <p className="text-xs font-semibold text-[#777168]">
                  Original bullet
                </p>
                <p className="mt-2 text-sm leading-6 text-[#3f3b35]">
                  Built BuildNest using Next.js, Tailwind CSS, Supabase,
                  PostgreSQL, and Vercel.
                </p>
              </div>
              <div className="hero-tailored rounded-md border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                <p className="text-xs font-semibold text-emerald-700">
                  Tailored bullet
                </p>
                <p className="mt-2 text-sm leading-6 text-[#15140f]">
                  Developed a deployed Next.js opportunity board with Tailwind
                  CSS, Supabase, PostgreSQL, and Vercel to support practical web
                  application workflows.
                </p>
              </div>
              <div className="hero-note rounded-md border border-[#e3d8c5] bg-white p-4">
                <p className="text-xs font-semibold text-[#777168]">
                  Change note
                </p>
                <p className="mt-2 text-sm leading-6 text-[#6b665d]">
                  Emphasized deployed web app and database integration because
                  the role asks for practical frontend projects.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e8dfcf] bg-[#fffaf1]/60 px-4 py-7 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 text-center sm:flex-row sm:gap-0">
          {trustStrip.map((item, index) => (
            <div className="flex items-center" key={item}>
              {index > 0 ? (
                <span className="mx-5 hidden h-4 w-px bg-[#d9cfbd] sm:block" />
              ) : null}
              <span className="text-sm font-medium text-[#6b665d]">
                {item}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section
        className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        id="demo"
      >
        <div className="mx-auto max-w-6xl rounded-lg border border-[#e3d8c5] bg-[#fffdf8] p-4 shadow-2xl shadow-[#c8bda8]/20 sm:p-6 lg:p-8">
          <div className="mb-6 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
              Interactive demo
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-[#15140f] sm:text-4xl">
              Try the resume tailoring demo
            </h2>
            <p className="mt-3 text-base leading-7 text-[#6b665d]">
              Use the example or paste your own resume and job description.
            </p>
          </div>

          <section className="grid gap-5 lg:grid-cols-2">
            <label className="flex flex-col gap-3 rounded-lg border border-[#e3d8c5] bg-[#fbf6ea] p-4 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b665d]">
                Current Resume
              </span>
              <textarea
                className="h-[240px] resize-y rounded-md border border-[#ded3c1] bg-white/85 p-4 text-sm leading-6 text-[#15140f] shadow-inner shadow-[#d7cbb8]/30 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-300 lg:h-[300px]"
                placeholder="Paste your current resume here..."
                value={resume}
                onChange={(event) => handleResumeChange(event.target.value)}
              />
            </label>

            <label className="flex flex-col gap-3 rounded-lg border border-[#e3d8c5] bg-[#fbf6ea] p-4 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b665d]">
                Job Description
              </span>
              <textarea
                className="h-[240px] resize-y rounded-md border border-[#ded3c1] bg-white/85 p-4 text-sm leading-6 text-[#15140f] shadow-inner shadow-[#d7cbb8]/30 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-300 lg:h-[300px]"
                placeholder="Paste the target job description here..."
                value={jobDescription}
                onChange={(event) =>
                  handleJobDescriptionChange(event.target.value)
                }
              />
            </label>
          </section>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              className="lift-on-hover inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#15140f] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-[#d9cfbd] disabled:text-[#777168] disabled:shadow-none"
              disabled={!canSubmit || loading}
              onClick={handleSubmit}
              type="button"
            >
              {loading ? (
                <Loader2
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin text-emerald-200"
                />
              ) : null}
              {loading ? "Tailoring resume..." : "Tailor Resume"}
            </button>

            <button
              className="lift-on-hover inline-flex min-h-11 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-800 hover:border-emerald-300 hover:bg-emerald-100"
              onClick={handleTryExample}
              type="button"
            >
              Try Example
            </button>

            <button
              className="lift-on-hover inline-flex min-h-11 items-center justify-center rounded-md border border-[#d9cfbd] bg-white/80 px-5 py-2.5 text-sm font-semibold text-[#15140f] hover:bg-white"
              onClick={handleClear}
              type="button"
            >
              Clear
            </button>
          </div>

          <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
            {error ? (
              <div
                className="rounded-lg border border-red-100 bg-red-50 p-5 shadow-sm lg:col-span-2"
                role="alert"
              >
                <h2 className="text-lg font-semibold text-red-950">
                  Something went wrong generating your tailored resume.
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-red-800">
                  {error}
                </p>
                <button
                  className="lift-on-hover mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#15140f] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-[#d9cfbd] disabled:text-[#777168] disabled:shadow-none"
                  disabled={!canSubmit || loading}
                  onClick={handleTryAgain}
                  type="button"
                >
                  {loading ? (
                    <Loader2
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin text-emerald-200"
                    />
                  ) : null}
                  {loading ? "Tailoring resume..." : "Try Again"}
                </button>
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-[#e3d8c5] bg-[#fbf6ea] p-4 shadow-sm">
                  <div className="flex flex-col gap-3 border-b border-[#e3d8c5] pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-[#15140f]">
                        Tailored Resume
                      </h2>
                      <p className="mt-1 text-sm text-[#6b665d]">
                        Tailored resume draft, ready to review and copy.
                      </p>
                    </div>
                    <button
                      className="lift-on-hover inline-flex min-h-10 items-center justify-center rounded-md border border-[#d9cfbd] bg-white/85 px-4 py-2 text-sm font-semibold text-[#15140f] hover:bg-white disabled:cursor-not-allowed disabled:text-[#9c9489] disabled:shadow-none"
                      disabled={!tailoredResume}
                      onClick={handleCopy}
                      type="button"
                    >
                      {copied ? "Copied!" : "Copy Tailored Resume"}
                    </button>
                  </div>

                  <div className="mt-4 max-h-[520px] min-h-[260px] overflow-auto rounded-md border border-[#e3d8c5] bg-white p-5 text-sm leading-7 text-[#15140f] shadow-sm sm:p-6">
                    <div className="whitespace-pre-wrap">
                      {tailoredResume ||
                        (loading ? (
                          <span className="inline-flex items-center gap-2 text-[#6b665d]">
                            <Loader2
                              aria-hidden="true"
                              className="h-4 w-4 animate-spin text-emerald-700"
                            />
                            Tailoring resume...
                          </span>
                        ) : (
                          "Your tailored resume will appear here after generation."
                        ))}
                    </div>
                  </div>
                </div>

                <aside className="rounded-lg border border-[#e3d8c5] bg-[#fbf6ea] p-4 shadow-sm">
                  <h2 className="text-lg font-semibold text-[#15140f]">
                    Change Notes
                  </h2>
                  <p className="mt-1 text-sm text-[#6b665d]">
                    Why the rewrite changed and what it matched.
                  </p>

                  {changeNotes.length > 0 ? (
                    <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-6 text-[#5c554c]">
                      {changeNotes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 text-sm leading-6 text-[#6b665d]">
                      Change notes will explain what was rewritten and why.
                    </p>
                  )}
                </aside>
              </>
            )}
          </section>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8" id="how-it-works">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-normal text-[#15140f]">
              How it works
            </h2>
            <p className="mt-3 text-base leading-7 text-[#6b665d]">
              A simple flow for turning a generic resume into a role-aware
              draft.
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {howItWorks.map((item, index) => {
              const Icon = item.icon;

              return (
                <article
                  className="lift-on-hover rounded-lg border border-[#e3d8c5] bg-[#fffdf8] p-5 shadow-sm shadow-[#c8bda8]/10"
                  key={item.title}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-md bg-emerald-50 text-emerald-800">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#777168]">
                      Step {index + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-[#15140f]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#6b665d]">
                    {item.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-normal text-[#15140f]">
              Why it is different
            </h2>
            <p className="mt-3 text-base leading-7 text-[#6b665d]">
              Tailor Fit is built around honesty first, then optimization.
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {differentiators.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  className="lift-on-hover rounded-lg border border-[#e3d8c5] bg-[#fffdf8] p-5 shadow-sm shadow-[#c8bda8]/10"
                  key={item.title}
                >
                  <span className="grid h-10 w-10 place-items-center rounded-md bg-emerald-50 text-emerald-800">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-[#15140f]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#6b665d]">
                    {item.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e8dfcf] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-sm font-medium text-[#6b665d]">
          Built for CodeStorm 2026 #2
        </div>
      </footer>
    </main>
  );
}
