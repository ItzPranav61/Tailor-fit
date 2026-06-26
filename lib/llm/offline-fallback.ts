import type { TailorResult } from "./types";

export const OFFLINE_DEMO_NOTICE =
  "Offline demo fallback shown because AI quota is temporarily unavailable.";

export const offlineDemoFallback: TailorResult = {
  tailoredResume: `${OFFLINE_DEMO_NOTICE}

Pranav Sawant

Target Role Summary
BSc IT student and student developer with hands-on project experience building practical web applications using Next.js, Tailwind CSS, Supabase, PostgreSQL, and Vercel. Built BuildNest as an opportunity board for student developers and worked on Aaspas, a hyperlocal community app with locality onboarding, posts, groups, and business discovery.

Relevant Projects / Experience
- Built BuildNest, a deployed opportunity board for student developers using Next.js, Tailwind CSS, Supabase, PostgreSQL, and Vercel.
- Added search, filtering, detail pages, and external links to help users discover and evaluate opportunities.
- Worked on Aaspas, a hyperlocal community application focused on locality onboarding, local posts, groups, and business discovery.
- Demonstrated frontend development through clean UI-focused project work and practical web application features.
- Used Supabase and PostgreSQL in project work, supporting the job description's database integration requirement.

Education
- BSc IT 2nd Year Student, Maharashtra

Skills
- Next.js
- Tailwind CSS
- Supabase
- PostgreSQL
- Vercel
- Frontend development
- Web application development`,
  changeNotes: [
    OFFLINE_DEMO_NOTICE,
    "Emphasized BuildNest because it matches the Web Developer Intern requirements for web development and deployed project experience.",
    "Highlighted search, filtering, detail pages, and external links because they map to practical frontend work and user-facing web application features.",
    "Emphasized Supabase and PostgreSQL because they support the job description's database integration requirement.",
    "Kept React as indirectly supported through Next.js context only; React is not listed as a separate skill in the fallback resume.",
    "Preserved Aaspas, education, tools, and project scope without adding fake metrics, job titles, companies, or unsupported skills.",
  ],
};
