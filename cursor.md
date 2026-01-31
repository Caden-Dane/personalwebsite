# Cursor Instructions — Professional Resume Supplement Website

## Purpose
This repository contains a personal professional website intended to
supplement a resume for internships and early-career full-time roles.

The site should communicate:
- Professionalism
- Product thinking
- Technical clarity
- Attention to structure and maintainability

This is not a marketing site or experimental playground.

---

## High-Level Principles
- Explicit structure over cleverness
- Readability over brevity
- Maintainability over speed
- Consistency over novelty

All decisions should bias toward how a small, disciplined frontend team
would build a production static site.

---

## Technology Constraints
- HTML, CSS, and JavaScript only
- No frameworks, bundlers, or build steps
- No external CDNs unless explicitly approved
- No inline styles or scripts

Assume the site is hosted as static files (e.g., GitHub Pages).

---

## Directory Expectations
- `src/pages/` contains page-level HTML only
- `src/components/` contains reusable HTML fragments
- `src/styles/` is layered (base → layout → components → pages)
- `src/scripts/` contains behavior and utilities
- `src/data/` contains structured content (JSON), not hardcoded strings
- `public/` contains static assets only

Do not create new directories unless explicitly instructed.

---

## HTML Guidelines
- Semantic HTML only
- Accessible markup (labels, alt text, ARIA where appropriate)
- Components must be reusable and composable
- No duplicated markup across pages

---

## CSS Guidelines
- Use CSS variables for colors, spacing, and typography
- Follow a layered CSS architecture
- Avoid overly specific selectors
- Prefer class-based styling over element overrides

---

## JavaScript Guidelines
- Keep JavaScript minimal and intentional
- No global variables
- Functions should be small and single-purpose
- No framework-like abstractions

---

## Content Strategy
- Treat content as data when reasonable
- Avoid hardcoding repeated content
- Prefer JSON-backed rendering for lists (projects, experience, etc.)

---

## Change Management Rules
- Make incremental changes only
- Do not refactor unrelated code
- Do not introduce new patterns without justification
- Document architectural decisions in `docs/decisions.md`

---

## Tone and Intent
Assume:
- Recruiters may view this repository
- Engineers may skim the code
- The goal is credibility, not flash

If a choice improves perceived professionalism, prefer it.

---

## Non-Goals
- No SEO optimization beyond basic semantics
- No animations unless subtle and purposeful
- No experimental UI patterns
- No premature optimization

---

## Final Instruction
If there is ambiguity:
- Choose the simplest professional solution
- Ask for clarification rather than guessing
