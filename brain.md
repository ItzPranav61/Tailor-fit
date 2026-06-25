# Tailor Fit — Project Brain

## 1. Project Identity

**Project Name:** Tailor Fit
**Hackathon:** CodeStorm 2026 #2
**Type:** AI resume tailoring tool
**Positioning:** Honest AI resume tailoring for students and job seekers.

Tailor Fit helps users paste their current resume and a target job description. The app rewrites the resume to better match the role while keeping the user's real experience intact.

The main promise:

> Tailor your resume to any job description — without faking experience.

Tailor Fit is not a fake resume generator. It is an honest rewriting assistant.

---

## 2. Core Problem

Job seekers often apply to many internships and jobs, but every role expects different keywords, skills, and priorities.

Manually tailoring a resume for every application is:

* Slow
* Repetitive
* Stressful
* Easy to skip
* Risky when using generic AI tools that may invent fake experience

Tailor Fit solves this by helping users create a role-aware resume draft while preserving honesty.

---

## 3. Target Users

Primary users:

* Students applying for internships
* Beginner developers
* Job seekers applying to many roles
* People who have real experience but struggle to present it properly

Secondary users:

* Career coaches
* Placement cell students
* Early-stage professionals

---

## 4. Product Promise

Tailor Fit should:

* Rephrase supported experience
* Align resume bullets with job description keywords
* Explain what changed and why
* Avoid fake claims
* Keep the user in control

Tailor Fit should NOT:

* Invent fake skills
* Invent fake work experience
* Add fake metrics
* Add fake companies
* Add fake job titles
* Add fake tools
* Pretend the AI worked when provider quota failed

---

## 5. Current MVP Features

### User-facing features

* Landing page with product positioning
* Trust badges
* Interactive demo section
* Resume textarea
* Job description textarea
* Try Example button
* Tailor Resume button
* Clear button
* Tailored resume output
* Change notes output
* Copy to clipboard
* Loading state
* Error state
* Quota-specific error message
* Offline demo fallback only for built-in Try Example flow

### Backend features

* `/api/tailor` route
* Request validation with Zod
* Gemini provider integration
* Gemini primary model
* Gemini fallback model
* Quota/rate-limit detection
* Safe provider error handling
* Try Example-only offline fallback

---

## 6. Tech Stack

Frontend:

* Next.js App Router
* React
* TypeScript
* Tailwind CSS

Backend:

* Next.js API route
* TypeScript
* Zod validation

AI:

* Google Gemini via `@google/genai`
* OpenAI SDK support exists but is optional and not required by default

Deployment:

* Vercel

Repository:

* GitHub

---

## 7. Important Links

Live Demo:
https://tailor-fit-eight.vercel.app/

GitHub:
https://github.com/ItzPranav61/Tailor-fit

Devfolio:
CodeStorm 2026 #2 project draft/submission

---

## 8. Main User Flow

### Normal real AI flow

1. User pastes resume.
2. User pastes job description.
3. User clicks Tailor Resume.
4. Frontend sends request to `/api/tailor`.
5. Backend validates input.
6. Gemini generates tailored resume and change notes.
7. Frontend displays:

   * Tailored resume draft
   * Change notes
8. User copies the result.

---

## 9. Try Example Flow

The Try Example button fills built-in sample content.

When Try Example is clicked:

* Resume textarea is filled with sample student developer resume.
* Job description textarea is filled with sample Web Developer Intern JD.
* `isExampleDemo` is set to `true`.
* Output, error, and change notes are cleared.

When the user manually edits either textarea:

* `isExampleDemo` becomes `false`.

When the user clicks Clear:

* Inputs are cleared.
* Output is cleared.
* Change notes are cleared.
* Error is cleared.
* `isExampleDemo` becomes `false`.

This matters because offline fallback is allowed only when `isExampleDemo === true`.

---

## 10. API Contract

Endpoint:

```txt
POST /api/tailor
```

Request body:

```json
{
  "resume": "string",
  "jobDescription": "string",
  "isExampleDemo": true
}
```

`isExampleDemo` is optional.

Success response shape:

```json
{
  "tailoredResume": "string",
  "changeNotes": ["string"]
}
```

Important:
Do not change this success response shape unless the frontend is updated carefully.

---

## 11. AI Honesty Rules

The AI prompt must strongly enforce:

* Do not invent standalone skills.
* Do not invent tools.
* Do not invent fake numbers.
* Do not invent companies.
* Do not invent job titles.
* Do not invent achievements.
* Do not convert implied knowledge into direct claimed experience.
* If something is indirectly supported, explain it in change notes.
* Do not use uncertain words like “potentially” inside the resume body.
* Missing or weakly supported skills should be handled honestly.

Example:

Good:

```txt
Built BuildNest using Next.js, a React-based framework.
```

Bad:

```txt
Experienced React developer.
```

Reason:
If the resume says Next.js but not React, React can be discussed as context, not claimed as standalone experience.

---

## 12. Gemini Provider Logic

Default setup:

```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash-lite
GEMINI_FALLBACK_MODEL=gemini-2.0-flash

OPENAI_API_KEY=your_openai_api_key_here_optional
OPENAI_MODEL=gpt-5.4-mini
```

Gemini behavior:

1. Try `GEMINI_MODEL`.
2. Retry transient errors.
3. If primary model fails due to transient issue, try `GEMINI_FALLBACK_MODEL`.
4. If quota/rate-limit `429` happens and `isExampleDemo === true`, use offline demo fallback.
5. If quota/rate-limit `429` happens and `isExampleDemo === false`, return safe quota message.
6. Unknown provider failures return generic safe message.

---

## 13. Offline Demo Fallback Rules

Offline fallback exists only to keep the hackathon demo reviewable when Gemini quota is exhausted.

It must only trigger when:

* Gemini returns confirmed quota/rate-limit `429`
* `isExampleDemo === true`

It must NOT trigger when:

* User pasted custom resume/JD
* User edited the Try Example text
* API key is missing
* Validation fails
* Model output is malformed
* Unknown provider error happens

Fallback output must:

* Be clearly labeled as offline demo fallback
* Use only the built-in BuildNest/Aaspas/Web Developer Intern sample
* Avoid fake metrics
* Avoid fake experience
* Avoid pretending the AI worked

Correct explanation:

```txt
Offline demo fallback shown because AI quota is temporarily unavailable.
```

---

## 14. Error Behavior

### Validation error

Show a clear validation message.

Examples:

```txt
Resume must be at least 50 characters.
Job description must be at least 50 characters.
```

### Gemini quota error with custom input

Show:

```txt
AI quota is temporarily unavailable. Please try again later or use the example demo.
```

### Unknown provider error

Show:

```txt
We could not tailor your resume right now. Please try again shortly.
```

Never leak raw provider errors to the client.

---

## 15. Frontend Design Direction

Current style:

* Warm cream/paper background
* Premium product landing page feel
* Dark text
* Emerald/teal accent
* Soft cards and borders
* Clean navbar
* Scroll progress bar
* Trust strip
* Interactive demo section
* How it works section
* Why it is different section
* Footer

Do not make the UI childish or overly colorful.

Design vibe:

* Calm
* Trustworthy
* Serious
* Career-focused
* Clean SaaS MVP

---

## 16. Devfolio Positioning

Tagline:

```txt
Honest AI resume tailoring.
```

Short description:

```txt
Tailor Fit rewrites resumes for job descriptions while keeping the user’s real experience honest and unchanged.
```

Problem it solves:

```txt
Job seekers often apply to many internships and jobs, but every job description expects different keywords, skills, and priorities. Manually tailoring a resume for each role is slow and stressful, especially for students and beginners.

Tailor Fit helps users paste their resume and a target job description, then generates a tailored resume draft that better matches the role while staying honest. It does not invent fake skills, fake experience, fake tools, or fake metrics.

The app also provides change notes so users can understand what was rewritten and why.
```

Challenges:

```txt
The biggest challenge was making the AI useful without making it dishonest. Resume tools can easily exaggerate experience, so we created strict prompt rules to prevent fake skills, tools, metrics, titles, or achievements.

Another challenge was AI reliability. Gemini sometimes returned quota or rate-limit errors, so we added retry handling, a Gemini fallback model, and a clearly labeled quota-only offline fallback to keep the demo reviewable without pretending the AI worked.

We also improved the frontend from a basic tool into a polished landing-page style product with a clear demo flow, trust badges, loading states, copy feedback, and clean output sections.
```

---

## 17. Demo Script

Use this 45-second pitch:

```txt
Tailor Fit helps students and job seekers tailor their resume for a specific job description.

The user pastes their current resume and the target job description. The app rewrites the resume to better match the role and also explains what changed through change notes.

The key difference is honesty. Tailor Fit does not invent fake skills, fake metrics, or fake experience. It only rephrases and highlights what is already supported by the user’s resume.

We also handled AI reliability. If Gemini quota is temporarily unavailable, the app does not fake output for custom input. It only shows a clearly labeled offline fallback for the built-in demo so reviewers can still understand the product flow.
```

---

## 18. Testing Checklist

Before final submission, test:

```txt
Hero loads correctly
Try Demo scrolls correctly
GitHub opens in new tab
Try Example fills resume and JD
Tailor Resume works
Output appears
Change Notes appear
Copy button works
Clear button resets all states
Custom input during quota failure shows quota message
Edited Try Example during quota failure does not use fallback
No fake metrics appear
No fake skills appear
Vercel live deployment works
Devfolio links work
```

Run:

```bash
npm run typecheck
npm run build
```

---

## 19. What Not To Add Before Submission

Do not add:

* Authentication
* Database
* Resume upload
* PDF parsing
* Payment
* User accounts
* Dashboard
* Multiple templates
* New AI providers
* Complex markdown renderer
* Random animations

The MVP is already enough.

Do not break the working flow chasing “one more feature.”

---

## 20. Next Improvements After Hackathon

Possible future upgrades:

* Real resume file upload
* PDF/DOCX parsing
* Multiple resume formats
* ATS keyword comparison
* Missing skills section
* Better markdown rendering
* Export to PDF
* User history
* Job application tracker
* Resume version comparison
* Cover letter tailoring

These are post-hackathon ideas, not current scope.

---

## 21. Current Project Status

Current status:

* MVP built
* Frontend polished
* Backend working
* Gemini integration added
* Gemini fallback model added
* Quota-specific UX added
* Try Example-only offline fallback added
* README updated
* GitHub pushed
* Vercel deployed
* Devfolio draft in progress

Main remaining task:

* Final Devfolio media and submission review
