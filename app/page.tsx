"use client";

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
      setTailoredResume(data.tailoredResume);
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

  return (
    <main className="min-h-screen bg-[#f7f5ef] px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Resume tailoring
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal text-zinc-950 sm:text-5xl">
            Tailor Fit
          </h1>
          <p className="mt-4 text-lg leading-8 text-zinc-700">
            Rewrite your resume for a job description without inventing fake
            experience.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              "No fake skills",
              "No invented experience",
              "Change notes included",
            ].map((badge) => (
              <span
                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"
                key={badge}
              >
                {badge}
              </span>
            ))}
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-2">
          <label className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <span className="text-sm font-semibold text-zinc-900">
              Current Resume
            </span>
            <textarea
              className="h-[240px] resize-y rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-900 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 lg:h-[300px]"
              placeholder="Paste your current resume here..."
              value={resume}
              onChange={(event) => setResume(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <span className="text-sm font-semibold text-zinc-900">
              Job Description
            </span>
            <textarea
              className="h-[240px] resize-y rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-900 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 lg:h-[300px]"
              placeholder="Paste the target job description here..."
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
            />
          </label>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 disabled:shadow-none"
            disabled={!canSubmit || loading}
            onClick={handleSubmit}
            type="button"
          >
            {loading ? "Tailoring Resume..." : "Tailor Resume"}
          </button>

          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100"
            onClick={handleTryExample}
            type="button"
          >
            Try Example
          </button>

          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
            onClick={handleClear}
            type="button"
          >
            Clear
          </button>

          {error ? (
            <p className="text-sm font-medium text-red-700" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-zinc-950">
                Tailored Resume
              </h2>
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400"
                disabled={!tailoredResume}
                onClick={handleCopy}
                type="button"
              >
                {copied ? "Copied!" : "Copy Tailored Resume"}
              </button>
            </div>

            <pre className="mt-4 min-h-[260px] whitespace-pre-wrap rounded-md bg-zinc-50 p-4 text-sm leading-7 text-zinc-900">
              {tailoredResume ||
                (loading
                  ? "Generating a tailored resume..."
                  : "Your tailored resume will appear here.")}
            </pre>
          </div>

          <aside className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">
              Change Notes
            </h2>

            {changeNotes.length > 0 ? (
              <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-6 text-zinc-700">
                {changeNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm leading-6 text-zinc-600">
                Notes about what changed and why will appear here.
              </p>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}
