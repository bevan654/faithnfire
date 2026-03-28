# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Faith & Fire Invitational — a volleyball tournament website for an event hosted by SMYM Adelaide South on 26 September 2026 at Reynella East College, Adelaide SA.

## Architecture

Multi-page static site served from the project root. No build step, no bundler, no package.json.

- **Pages**: `index.html` (home with fire animation), `schedule.html`, `teams.html`, `rules.html`, `registration.html`, `venue.html`, `faq.html`, `contact.html`
- **Shared CSS**: `styles.css` (base styles, typography, layout components), `nav.css` (navigation bar and mobile hamburger)
- **Shared JS**: `shared.js` (mobile nav toggle)
- **Home animation**: GSAP 3.12 from CDN, inline `<script>` in `index.html` only — no other page loads GSAP
- **Hosting**: Vercel static site (`vercel.json` sets `outputDirectory: "."`)
- **Fonts**: Google Fonts — Bebas Neue (titles), Cormorant Garamond (body text/ampersand), Space Mono (UI/labels)
- **Countdown target**: `2026-09-26T09:00:00+09:30` (Adelaide timezone)

## Development

No install or build commands. Open any `.html` file in a browser or run a local server:

```
npx serve .
```

## Key Conventions

- **Home page opacity pattern**: `index.html` uses `<body class="home">`. Shared CSS sets elements visible (`opacity: 1`), but `.home` scoped inline styles override to `opacity: 0` so GSAP can animate them in. Inner pages render immediately with no JS dependency.
- **Navigation**: `.site-nav` replaces the old `.top-bar`. Active page link gets `class="active"` for an ember-colored underline. Mobile menu toggles via `.nav-toggle` button.
- **CSS custom properties**: `:root` in `styles.css` defines the palette — `--ember`, `--flame-orange`, `--flame-yellow`, `--black`, `--white`, `--grey`, `--accent`.
- **Typography hierarchy**: `.page-title` (Bebas Neue), `.section-heading` (Bebas Neue), `.body-text` (Cormorant Garamond), `.label-text` (Space Mono)
- **Content blocks**: `.content-card` for bordered sections with decorative corner marks (pseudo-elements). `.timeline` for schedule. `.faq-item` using native `<details>`/`<summary>`.
- **Forms**: `.form-input`, `.form-textarea`, `.form-submit` — transparent background, bottom-border style, ember highlight on focus.
- **Ember particles**: Dynamically created DOM elements appended to `#embers` and removed after animation. Ongoing fire system starts at GSAP timeline position 5.5s.
