# Architectural Decisions

## Experience links (document vs website)

The `experiences.json` schema was extended with an optional `links` array per experience. Each link has `label`, `href`, and `type` (`"document"` or `"website"`). Document links trigger a confirmation modal before download; website links open normally. This keeps downloadable assets (PDFs, etc.) behind a single confirmation step as required.
