# Data Model — JSON Schema and Usage

This document defines the JSON data model for the personal website. All files live in `src/data/`. Content is consumed by the main page and edited via `/secret`.

---

## 1. skills.json

### Schema

```json
{
  "categories": [
    { "id": "frontend", "label": "Frontend", "order": 1 },
    { "id": "backend", "label": "Backend", "order": 2 }
  ],
  "skills": [
    {
      "id": "js",
      "label": "JavaScript",
      "categoryId": "frontend"
    },
    {
      "id": "python",
      "label": "Python",
      "categoryId": "backend"
    }
  ]
}
```

- **categories**: Ordered list of skill groups. `id` is stable; `label` is display text; `order` controls section order on the page.
- **skills**: Reusable skill entities. `id` is unique and stable (referenced by experiences). `label` is display name. `categoryId` references a category `id` for grouping.

### Main page usage

- Load `skills.json` once.
- Group skills by `categoryId` using the order defined in `categories`.
- Render the Skills section as category headings with skill labels (e.g. list or tags). No duplicate definitions; each skill is a single entity.
- Skills are not rendered inside the Experience section; experiences reference skill IDs for optional use (e.g. “skill tags” per role, or a separate lookup for consistency).

### Secret page usage

- List all categories; allow add/edit/delete and reorder (update `order`).
- List all skills; allow add/edit/delete. When editing a skill, choose one category from a dropdown sourced from `categories`. New skills get a stable `id` (e.g. slug from label or explicit field).
- Save writes the full `skills.json` (or a patch if the secret page supports it). No other files reference category or skill text; only experience references are by `id`.

---

## 2. experiences.json

### Schema

```json
{
  "experiences": [
    {
      "id": "exp-1",
      "period": "2024–2025",
      "title": "Software Engineer Intern",
      "organization": "Company Name",
      "description": "Short paragraph or bullet summary.",
      "skillIds": ["js", "python", "react"]
    }
  ]
}
```

- **experiences**: Array of items in reverse chronological order (most recent first).
- **id**: Unique, stable (e.g. for future deep-links or DOM hooks). Optional if list is never reordered by ID.
- **period**: Display string (e.g. "2024–2025", "Summer 2024").
- **title**: Role or position title.
- **organization**: Company, team, or project name.
- **description**: Plain text or minimal inline structure (e.g. one paragraph); main page can optionally support line breaks.
- **skillIds**: Array of IDs from `skills.json`. Main page resolves IDs to labels when rendering (e.g. tags per experience).

### Main page usage

- Load `experiences.json` and optionally `skills.json`.
- Render the Experience section as a vertical timeline: for each experience, output period, title, organization, description. For each `skillId` in `skillIds`, look up the skill label and render as a tag or list.
- Order is the array order; no client-side sort required.

### Secret page usage

- List experiences in order; allow add/edit/delete and reorder (drag or up/down).
- Edit form: period, title, organization, description (textarea). Skill association: multi-select or tag input backed by `skills.json` (options from `skills.skills`, store only `id` in `skillIds`). Validate that every `skillId` exists in `skills.json`.
- Save writes the full `experiences.json`. Reusable skills stay in `skills.json`; experiences only store references.

---

## 3. books.json

### Schema

```json
{
  "books": [
    {
      "id": "b1",
      "title": "Book Title",
      "author": "Author Name",
      "url": "https://...",
      "status": "read",
      "note": "Optional one-line note."
    }
  ]
}
```

- **books**: Array of book entries. Order is explicit (e.g. “currently reading” first, then by date or manual order).
- **id**: Unique, stable (for reorder or delete on secret page).
- **title**: Book title (required).
- **author**: Author name (required for display).
- **url**: Optional link (e.g. Goodreads, Amazon, or publisher). Omit or empty string if none.
- **status**: Optional display hint — e.g. `"reading"`, `"read"`, `"recommended"`. Main page can style or group by status, or ignore and show a flat list.
- **note**: Optional one-line note (e.g. “Favorite chapter: 3”). Kept short for compact display.

### Main page usage

- Load `books.json`.
- Render the Books section as a compact list or grid: each item is title, author, optional link (wrap title or “Link”), optional note. Status can drive a small label or section grouping (e.g. “Currently reading” vs “Read”). No heavy text; keep each item display-efficient.

### Secret page usage

- List books; allow add/edit/delete and reorder.
- Edit form: title, author, url (optional), status (dropdown or fixed set), note (single line). Save writes the full `books.json`.

---

## 4. contact.json

### Schema

```json
{
  "entries": [
    {
      "id": "email",
      "label": "Email",
      "value": "you@example.com",
      "href": "mailto:you@example.com",
      "order": 1
    },
    {
      "id": "linkedin",
      "label": "LinkedIn",
      "value": "linkedin.com/in/username",
      "href": "https://linkedin.com/in/username",
      "order": 2
    }
  ]
}
```

- **entries**: Array of contact methods. Each is one channel (email, LinkedIn, GitHub, etc.).
- **id**: Unique, stable key (e.g. "email", "linkedin", "github").
- **label**: Display text (e.g. "Email", "LinkedIn").
- **value**: Display-only or fallback text (e.g. visible email or username). Used when link is not shown or as accessible text.
- **href**: Optional. If present, the entry is a link; if missing, render as text only.
- **order**: Controls display order on the main page.

### Main page usage

- Load `contact.json`.
- Render the Contact section: for each entry in `entries` (sorted by `order`), output label and either a link (`href`) or plain text (`value`). Use `value` for link text or aria-label when appropriate so contact info is editable without code changes.

### Secret page usage

- List contact entries; allow add/edit/delete and reorder (update `order`).
- Edit form: label, value, href (optional). Id can be auto-generated or editable for new entries (e.g. slug). Save writes the full `contact.json`.

---

## Summary

| File             | Purpose                    | Key relationships                          |
|------------------|----------------------------|--------------------------------------------|
| skills.json      | Reusable skills + grouping | Referenced by experiences via `skillIds`   |
| experiences.json | Timeline of roles          | References `skills[].id`                   |
| books.json       | Compact book list          | Standalone                                 |
| contact.json     | Editable contact methods   | Standalone                                 |

All content is file-based JSON. The main page reads these files (e.g. via fetch or build-time include) and renders structure only; styling is separate. The secret page loads the same files, provides forms per entity, and overwrites (or patches) the corresponding JSON file. For static hosting without a backend, the secret page would need a save mechanism that updates the repo (e.g. GitHub API or manual copy-paste); the data model itself does not assume a specific save implementation.
