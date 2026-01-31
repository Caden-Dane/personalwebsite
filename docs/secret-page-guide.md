# How to Use the Secret Page

The secret page lets you edit all site content (about text, experiences, skills, books, contact, images) without changing code. Changes are saved **only in your browser** until you download the updated JSON files and replace the files in your project. This guide walks through every step from entering a value to seeing it on the live site.

**Important:** The secret page does not upload files to a server. You edit in the browser, download the updated JSON, then manually replace the files in `src/data/` (and, for the resume, put the PDF in `public/`). After that, reload the main site (or push to GitHub and wait for the site to rebuild).

---

## Before You Start

1. **Serve the site locally**  
   The secret page loads JSON from `src/data/`. Browsers block `fetch()` to local files, so you must serve the project (e.g. run a local server from the project root).

   - From the project root: `npx serve .` or `python -m http.server 8000`
   - Open the secret page: `http://localhost:3000/secret/` (or `http://localhost:8000/secret/`)

2. **Know your repo name**  
   If you host on GitHub Pages as a **project site** (e.g. `username.github.io/PersonalWebsite`), the site root is `https://username.github.io/PersonalWebsite/`. Any path you use (like the resume URL) must start with `/PersonalWebsite/` (use your actual repo name). For a **user/org site** (`username.github.io`), the root is `/` and you can use paths like `/public/resume.pdf`.

---

## General Flow (Any Section)

For **every** type of content (about, contact, experiences, skills, books, images), the process is the same:

| Step | What you do |
|------|----------------|
| 1 | Open the secret page (e.g. `http://localhost:3000/secret/`). |
| 2 | Edit the form or list (add/edit/delete as needed). |
| 3 | Click the **Save** button for that section (e.g. **Save contact**). |
| 4 | Click the **Download [filename].json** button for that section. Your browser will download the updated JSON file. |
| 5 | In your project folder, **replace** the existing file in `src/data/` with the file you just downloaded (same name, same location). |
| 6 | If you added or changed a **file** (e.g. resume PDF, image), put that file in the right place (e.g. `public/` or `public/documents/`). |
| 7 | Reload the main website (or push to GitHub and wait for the site to rebuild). |

The main site reads from `src/data/*.json` (and, for the resume, from the path you put in the JSON). Until you replace those files and reload, the site will not show your changes.

---

## Example: Adding Your Resume

This is the full sequence for making the main site’s “Download Resume” button open your real resume PDF.

### Step 1: Put the resume file in the project

1. Place your resume PDF in the **`public/`** folder.
2. Example: `public/resume.pdf`  
   So the file on disk is: `YourProject/public/resume.pdf`.

### Step 2: Open the secret page

1. Start a local server from the **project root** (e.g. `npx serve .`).
2. In the browser, go to: `http://localhost:3000/secret/` (or whatever port your server uses).
3. Wait for the page to load; it will load all JSON from `src/data/`.

### Step 3: Edit the resume URL in the Contact section

1. Scroll to the **Contact** section.
2. Find the **Resume URL** field.
3. Enter the path to your resume **as the site will see it**:
   - **If you use a custom domain** (e.g. `cadenice.com`):  
     Use: `/public/resume.pdf` (or whatever filename you used, e.g. `/public/cadeniceresume.pdf`).  
     The browser asks for a path, not a full URL; the domain is already the root.
   - **If you’re on GitHub Pages project site** (`username.github.io/YourRepoName`) with no custom domain:  
     Use: `/YourRepoName/public/resume.pdf`  
     (Replace `YourRepoName` with your repo name, e.g. `PersonalWebsite`.)
   - **If you’re on a user/org site** (`username.github.io`) or testing locally with root at project:  
     Use: `/public/resume.pdf`
4. Optionally edit **Invitation text** and **Contact entries** (email, phone, LinkedIn, etc.).
5. Click **Save contact**.  
   You should see a green message like: *“Contact saved. Download contact.json to apply.”*

### Step 4: Download the updated contact.json

1. In the Contact section, click **Download contact.json**.
2. Your browser will download a file named `contact.json`.
3. You should see a message like: *“contact.json downloaded. Replace src/data/contact.json and reload the main page.”*

### Step 5: Replace the contact file in the project

1. Open your project folder in File Explorer (or Finder).
2. Go to: `src/data/`.
3. **Replace** the existing `contact.json` with the `contact.json` you just downloaded (same name, same folder).  
   So the project now has your new `resumeUrl` (and any other contact changes) in `src/data/contact.json`.

### Step 6: Reload the main site

1. Open the main site (e.g. `http://localhost:3000/` or `http://localhost:3000/src/pages/index.html` depending on your server).
2. **Reload the page** (F5 or Ctrl+R / Cmd+R).  
   The main site reads `src/data/contact.json` again, so it will now use your new `resumeUrl`.
3. Click **Download Resume** on the main page; it should open or download your PDF from the path you set (e.g. `/public/resume.pdf` or `/PersonalWebsite/public/resume.pdf`).

**If you host on GitHub:** After you push the updated `src/data/contact.json` and `public/resume.pdf`, wait for GitHub Pages to rebuild. Then visit your live site and test “Download Resume” again. The URL in `resumeUrl` must match how GitHub serves the file (see “Know your repo name” above).

---

## Images (Hero background, About photos)

Images on the main site (hero background and the three About section photos) are managed in the **Images** section of the secret page. Each slot is labeled with where it appears on the main page (e.g. "Main page: Hero background (Home section)", "Main page: About section — Photo 1").

**How it works:** When you drag and drop an image, the secret page converts it to a **data URL** (a long string embedded in JSON). No separate image files are stored in `public/` — the image data lives inside `src/data/images.json`. That keeps everything in one place and works on static hosting.

### Step-by-step: Adding or changing an image

1. **Open the secret page** (with a local server running, e.g. `http://localhost:3000/secret/`).

2. **Find the Images section** at the top of the secret page. You'll see one block per slot (Hero background, About — Photo 1, About — Photo 2, About — Photo 3). Each block shows:
   - **Main page: [label]** — which slot you're editing
   - A preview (or "No image")
   - A **"Drag and drop image here"** area
   - **Delete image** (clears the slot)

3. **Add or replace an image**
   - **Drag and drop:** Drag an image file (JPEG, PNG, etc.) from your computer onto the "Drag and drop image here" area for that slot. The preview updates and a green message appears (e.g. "Image updated. Download images.json to apply.").
   - **Delete:** Click **Delete image** to clear that slot. The main site will show the placeholder (or no image) for that slot.

4. **Download images.json**  
   In the Images section, click **Download images.json**. Your browser downloads the current `images.json` (including any new image data as data URLs).

5. **Replace the file in the project**  
   In your project folder, go to `src/data/` and **replace** the existing `images.json` with the file you just downloaded (same name, same location).

6. **Reload the main site**  
   Reload the main website. The hero background and/or About photos will show your new images.  
   If you host on GitHub, push the updated `src/data/images.json` and wait for the site to rebuild.

**Note:** Images stored as data URLs can make `images.json` large. For very big images, consider resizing before dropping. You do **not** put image files in `public/` for these slots — the secret page embeds them in the JSON.

---

## Documents in experience sections (PDFs, reports, etc.)

Experiences can have **links** (e.g. "Report (PDF)", "Sample Dashboard"). Links can be **Website** (opens normally) or **Document** (the main site shows a "Download?" confirmation, then opens or downloads the file). The file itself (e.g. a PDF) must live in your project; the experience only stores the **path** to it.

### Step-by-step: Adding a document link to an experience

1. **Put the file in the project**  
   Place the PDF (or other file) in **`public/documents/`**.  
   Example: `public/documents/report-2024.pdf`  
   Create the `documents` folder inside `public/` if it doesn't exist.

2. **Open the secret page** (e.g. `http://localhost:3000/secret/`).

3. **Edit the experience**  
   In the **Experiences** section, find the experience and click **Edit** (or click **Add experience** to create a new one).

4. **Add a link**
   - Click **+ Add link**.
   - **Label:** Text visitors see (e.g. "Report (PDF)", "Case study").
   - **URL:** The path to the file **as the browser will request it**:
     - **Custom domain** (e.g. cadenice.com): `/public/documents/report-2024.pdf`
     - **GitHub project site** (no custom domain): `/YourRepoName/public/documents/report-2024.pdf`
   - **Type:** Choose **Document** so the main site shows the download confirmation before opening the file. Use **Website** for normal web links (e.g. a dashboard URL).

5. **Save the experience**  
   Click **Save experience**. You should see a green message like "Experience saved. Download experiences.json to apply."

6. **Download experiences.json**  
   In the Experiences section, click **Download experiences.json**. Your browser downloads the updated file (including the new link).

7. **Replace the file in the project**  
   In your project folder, go to `src/data/` and **replace** the existing `experiences.json` with the file you just downloaded.

8. **Reload the main site**  
   Reload the main website. The experience will show the new link. Clicking it (with type "Document") will show "Download [label]?" and then open or download the file from the path you set.  
   If you host on GitHub, push the updated `src/data/experiences.json` and `public/documents/yourfile.pdf`, then wait for the site to rebuild.

**Summary for experience documents:**  
Put the file in `public/documents/`. On the secret page, edit the experience → add a link with label, URL = path (e.g. `/public/documents/report-2024.pdf`), type = Document → Save experience → Download experiences.json → replace `src/data/experiences.json` → reload (or push).

---

## Section-by-Section Summary

| Section | What you edit | Save button | Download button | Where to put files |
|--------|----------------|-------------|------------------|--------------------|
| **Contact** | Resume URL, invitation text, contact entries (email, phone, LinkedIn, etc.) | Save contact | Download contact.json | Resume PDF → `public/resume.pdf` (or `public/documents/`). |
| **Experiences** | Add/edit/delete experiences; period, title, org, description; skills (checkboxes); links | Save experience | Download experiences.json | Experience PDFs → `public/documents/`. Set each link’s `href` in the form to the path (e.g. `/PersonalWebsite/public/documents/report.pdf`). |
| **Skills & Categories** | Add/edit/delete categories and skills; associate skills with experiences via the experience form | Save category / Save skill | Download skills.json | None. |
| **Books** | Add/edit/delete books; title, author, URL, status, note | Save book | Download books.json | None (optional book URL can point anywhere). |
| **Images** | Hero background, About photos: drag-and-drop image or Delete; each slot is labeled by where it appears on the main page | (no Save; drop or Delete updates in memory) | Download images.json | Replace `src/data/images.json`; images are stored as data URLs in that file (no separate image files needed unless you change the setup). |

For every section: after you **Save** (or, for Images, after you drop/delete), you must **Download** the corresponding JSON, **replace** the file in `src/data/`, then **reload the main site** (or push and wait for deploy).

---

## Troubleshooting

- **“Failed to load data” on the secret page**  
  You’re probably opening the HTML file directly (`file:///...`). Use a local server (e.g. `npx serve .`) and open `http://localhost:3000/secret/`.

- **Main site doesn’t show my changes**  
  Make sure you (1) replaced the correct file in `src/data/` with the downloaded JSON, and (2) reloaded the main page (or pushed and waited for GitHub Pages to rebuild).

- **“Download Resume” opens the wrong file or 404**  
  Check that (1) the PDF is in `public/` (e.g. `public/cadeniceresume.pdf`), and (2) `resumeUrl` in `src/data/contact.json` is the path the browser will request (e.g. `/public/cadeniceresume.pdf` for a custom domain like cadenice.com, or `/YourRepoName/public/resume.pdf` for a GitHub project site without a custom domain).

- **“Please enter a URL” when saving Contact (Resume URL)**  
  The Resume URL field expects a **path** (e.g. `/public/cadeniceresume.pdf`), not a full URL. If you see this message, the input was previously validated as a full URL; it has been changed to accept paths. Refresh the secret page and try again. Enter only the path: `/public/yourfilename.pdf`.

- **I changed something but didn’t download the JSON**  
  Edits on the secret page only live in memory until you click **Download [filename].json** and replace the file in `src/data/`. You must click **Save** first (e.g. Save contact), then **Download**; if Save was blocked (e.g. by validation), Download will still have the old data. Always save, then download and replace.
