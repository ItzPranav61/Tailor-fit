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
import { useState } from "react";

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

  const canSubmit = resume.trim().length > 0 && jobDescription.trim().length > 0;

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
        }),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const data = (await response.json().catch(() => null)) as
            | ErrorResponse
            | null;

          setError(data?.message || "Please check your resume and job description.");
          return;
        }

        throw new Error("Tailor request failed.");
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
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Copy failed. Please select and copy the tailored resume text.");
    }
  }

  function handleClear() {
    setResume("");
    setJobDescription("");
    resetOutputState();
  }

  function handleTryExample() {
    setResume(exampleResume);
    setJobDescription(exampleJobDescription);
    resetOutputState();
  }

  function handleTryAgain() {
    void handleSubmit();
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-slate-950">
      <nav className="sticky top-0 z-20 border-b border-slate-200/80 bg-[#f7f5ef]/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <a className="flex items-center gap-3" href="#">
            <span className="grid h-9 w-9 place-items-center rounded-md border border-emerald-200 bg-emerald-50 shadow-sm">
              <svg
                aria-hidden="true"
                className="h-6 w-6 text-emerald-700"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 5h12M12 5v14M7 15l3 3 7-8"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.4"
                />
              </svg>
            </span>
            <span className="text-base font-semibold text-slate-950">
              Tailor Fit
            </span>
          </a>

          <div className="flex items-center gap-2">
            <a
              className="lift-on-hover rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white hover:text-slate-950"
              href="#demo"
            >
              Demo
            </a>
            <a
              className="lift-on-hover rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:border-emerald-300 hover:text-emerald-800"
              href="https://github.com/ItzPranav61/Tailor-fit"
              rel="noreferrer"
              target="_blank"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>

      <section className="px-4 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-16 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Honest resume tailoring
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
              Tailor your resume to any job description — without faking
              experience.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              Paste your resume and a job description. Tailor Fit rewrites your
              resume to match the role, explains what changed, and keeps your
              experience honest.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {heroBadges.map((badge) => (
                <span
                  className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm"
                  key={badge}
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="lift-on-hover inline-flex min-h-12 items-center justify-center rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
                href="#demo"
              >
                Try Demo
              </a>
              <a
                className="lift-on-hover inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:border-emerald-300 hover:text-emerald-800"
                href="https://github.com/ItzPranav61/Tailor-fit"
                rel="noreferrer"
                target="_blank"
              >
                View GitHub
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Live workflow
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  Resume rewrite preview
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                Honest rewrite
              </span>
            </div>
            <div className="mt-5 space-y-3">
              <div className="hero-original rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Original bullet
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-800">
                  Built BuildNest using Next.js, Tailwind CSS, Supabase,
                  PostgreSQL, and Vercel.
                </p>
              </div>
              <div className="hero-tailored rounded-md border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-semibold text-emerald-700">
                  Tailored bullet
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-900">
                  Developed a deployed Next.js opportunity board with Tailwind
                  CSS, Supabase, PostgreSQL, and Vercel to support practical web
                  application workflows.
                </p>
              </div>
              <div className="hero-note rounded-md border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Change note
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Emphasized deployed web app and database integration because
                  the role asks for practical frontend projects.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-8" id="demo">
        <div className="mx-auto max-w-7xl rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60 sm:p-6 lg:p-8">
          <div className="mb-6 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Interactive demo
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
              Try the resume tailoring demo
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-700">
              Use the example or paste your own resume and job description.
            </p>
          </div>

          <section className="grid gap-5 lg:grid-cols-2">
            <label className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-[#fbfaf7] p-4">
              <span className="text-sm font-semibold text-slate-900">
                Current Resume
              </span>
              <textarea
                className="h-[240px] resize-y rounded-lg border border-gray-200 bg-white p-4 text-sm leading-6 text-slate-900 shadow-inner shadow-slate-100/60 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-300 lg:h-[300px]"
                placeholder="Paste your current resume here..."
                value={resume}
                onChange={(event) => setResume(event.target.value)}
              />
            </label>

            <label className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-[#fbfaf7] p-4">
              <span className="text-sm font-semibold text-slate-900">
                Job Description
              </span>
              <textarea
                className="h-[240px] resize-y rounded-lg border border-gray-200 bg-white p-4 text-sm leading-6 text-slate-900 shadow-inner shadow-slate-100/60 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-300 lg:h-[300px]"
                placeholder="Paste the target job description here..."
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
              />
            </label>
          </section>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              className="lift-on-hover inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
              disabled={!canSubmit || loading}
              onClick={handleSubmit}
              type="button"
            >
              {loading ? (
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              ) : null}
              {loading ? "Tailoring Resume..." : "Tailor Resume"}
            </button>

            <button
              className="lift-on-hover inline-flex min-h-11 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-800 hover:border-emerald-300 hover:bg-emerald-100"
              onClick={handleTryExample}
              type="button"
            >
              Try Example
            </button>

            <button
              className="lift-on-hover inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
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
                  className="lift-on-hover mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
                  disabled={!canSubmit || loading}
                  onClick={handleTryAgain}
                  type="button"
                >
                  {loading ? (
                    <Loader2
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin"
                    />
                  ) : null}
                  {loading ? "Trying Again..." : "Try Again"}
                </button>
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-slate-200 bg-[#fbfaf7] p-4">
                  <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-950">
                        Tailored Resume
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        Tailored resume draft, ready to review and copy.
                      </p>
                    </div>
                    <button
                      className="lift-on-hover inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400 disabled:shadow-none"
                      disabled={!tailoredResume}
                      onClick={handleCopy}
                      type="button"
                    >
                      {copied ? "Copied!" : "Copy Tailored Resume"}
                    </button>
                  </div>

                  <div className="mt-4 max-h-[520px] min-h-[260px] overflow-auto rounded-lg border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-900 shadow-sm sm:p-6">
                    <div className="whitespace-pre-wrap">
                      {tailoredResume ||
                        (loading ? (
                          <span className="inline-flex items-center gap-2 text-slate-600">
                            <Loader2
                              aria-hidden="true"
                              className="h-4 w-4 animate-spin text-emerald-700"
                            />
                            Generating a tailored resume...
                          </span>
                        ) : (
                          "Your tailored resume will appear here."
                        ))}
                    </div>
                  </div>
                </div>

                <aside className="rounded-lg border border-slate-200 bg-[#fbfaf7] p-4">
                  <h2 className="text-lg font-semibold text-slate-950">
                    Change Notes
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Why the rewrite changed and what it matched.
                  </p>

                  {changeNotes.length > 0 ? (
                    <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-6 text-slate-700">
                      {changeNotes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      Notes about what changed and why will appear here.
                    </p>
                  )}
                </aside>
              </>
            )}
          </section>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-normal text-slate-950">
              How it works
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-700">
              A simple flow for turning a generic resume into a role-aware
              draft.
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {howItWorks.map((item, index) => {
              const Icon = item.icon;

              return (
                <article
                  className="lift-on-hover rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                  key={item.title}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-md bg-emerald-50 text-emerald-800">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Step {index + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {item.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-normal text-slate-950">
              Why it is different
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-700">
              Tailor Fit is built around honesty first, then optimization.
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {differentiators.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  className="lift-on-hover rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                  key={item.title}
                >
                  <span className="grid h-10 w-10 place-items-center rounded-md bg-emerald-50 text-emerald-800">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {item.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-sm font-medium text-slate-600">
          Built for CodeStorm 2026 #2
        </div>
      </footer>
    </main>
  );
}
