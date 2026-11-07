# Konvene

**Find it. Pick it. You're in.**

Konvene is a responsive event management website for campus life. Students can browse upcoming events, search and filter them, read the details and register with a validated form, all in under a minute. It is built with plain **HTML5, CSS3 and vanilla JavaScript**: no framework, no build step and no dependencies apart from Google Fonts.

Built for the **K Explore: Web Designing** challenge by Kavish, CSE, KIIT University, Bhubaneswar.

| | |
|---|---|
| **Live site** | https://konvene-three.vercel.app |
| **GitHub repository** | https://github.com/kavishht/konvene |

> **Data note:** the upcoming events are sample data. Their dates move with today's date, so registration can always be tested. The **Past** tab lists real KIIT events (Omega 6.0 events, Darted Pixels, Hauntfest, KIIT Karnival / KIIT Fest 9.0) with their posters.

---

## Contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [Project structure](#project-structure)
4. [How it works](#how-it-works)
5. [Run locally](#run-locally)
6. [Deploy](#deploy)
7. [Git workflow](#git-workflow)
8. [Known limitations](#known-limitations)
9. [Possible improvements](#possible-improvements)

---

## Features

### Browse and discover
- **Upcoming and Past tabs.** Past events are greyed out with registration closed.
- **Hero section** with a live countdown to the next event.
- **Animated ticker** of event categories.
- **Event cards** showing name, date, venue, art or poster, short description and seats left.
- **Search** by name, venue or keyword, plus **category filter chips**.
- **Details dialog** with schedule, venue, seat count, poster and its own countdown timer.

### Register
- **Registration form** (name, email, phone, event) with JavaScript validation and inline error messages.
- **Confirmation screen** with a reference ID after a successful registration.
- **Saved in Local Storage**, with duplicate checks, live seat count updates and a **My registrations** panel that supports cancelling.

### Design and accessibility
- **Dark and light mode**, remembered between visits and defaulting to the system setting.
- **Responsive layout** for mobile, tablet and desktop.
- **Accessibility:** keyboard focus styles, labelled form fields, `aria-live` regions and `prefers-reduced-motion` support.

---

## Tech stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (custom properties, Grid, Flexbox) |
| Logic | Vanilla JavaScript |
| Storage | Browser Local Storage |
| Fonts | Google Fonts |
| Hosting | Vercel (static site) |

---

## Project structure

```
konvene/
├── index.html     page structure, dialogs, form markup
├── style.css      design tokens, layout, components, responsive rules
├── script.js      event data, rendering, filters, countdowns, validation, storage
├── README.md
└── images/
    ├── omega.jpg
    ├── darted-pixels.jpg
    ├── hauntfest.jpg
    └── karnival.jpg
```

---

## How it works

- **Data:** events live in the `EVENTS` array at the top of `script.js`. Add or edit objects there to change what the site shows.
- **Rendering:** `renderGrid()` rebuilds the cards from the current tab, search text and category.
- **Validation:** each field has a rule in the `rules` object. Fields validate on blur and re-check as the user types. Phone numbers accept 10 digit Indian mobile numbers, with or without `+91`.
- **Storage:** registrations are stored as JSON under the `konvene-registrations` key. Seats left are computed as total seats minus stored registrations for that event.
- **Theming:** colours are CSS variables. The `data-theme` attribute on `<html>` swaps the palette.
- **Images:** paths are relative (for example `images/omega.jpg`), so the `images` folder must stay in the project root.

---

## Run locally

No installation needed. Pick whichever option you like.

### Option 1: Clone the repository (recommended)

```bash
git clone https://github.com/kavishht/konvene.git
cd konvene
```

Then open the site in one of these ways:

- Double-click `index.html`, or
- Serve the folder with `npx serve .` and open the address it prints (usually `http://localhost:3000`), or
- In VS Code, right-click `index.html` and choose **Open with Live Server**.

### Option 2: Download as ZIP

1. On the [repository page](https://github.com/kavishht/konvene), click **Code** > **Download ZIP**.
2. Extract the ZIP and open `index.html` in your browser.

Keep the `images` folder next to `index.html`, or the posters will not load.

---

## Deploy

The live site runs on **Vercel**, connected to this repository. Every push to `main` redeploys it automatically.

- **Vercel / Netlify:** import the repository. Preset **Other**, no build command, output directory is the repo root.
- **GitHub Pages:** push to GitHub, then Settings > Pages > deploy from the `main` branch root.

---

## Git workflow

### First-time setup

```bash
git init
git add .
git commit -m "feat: initial Konvene event site"
git branch -M main
git remote add origin https://github.com/kavishht/konvene.git
git push -u origin main
```

### Everyday changes

```bash
git status                      # see what changed
git add .                       # stage the changes
git commit -m "feat: your message"
git push                        # upload to GitHub (Vercel redeploys automatically)
```

### Commit style

Work was done in small commits, one per feature, so the history shows the progress. Messages start with a type:

| Prefix | Used for | Example |
|---|---|---|
| `feat:` | a new feature | `feat: search and filters` |
| `style:` | look and feel | `style: dark mode` |
| `docs:` | documentation | `docs: add live site and repository links` |

---

## Known limitations

- Registration is **frontend only**. Nothing is sent to a server and **no confirmation emails are sent**.
- Registrations live in one browser on one device. Clearing browser data removes them.
- Upcoming events are sample data, not real listings.

---

## Possible improvements

- Real confirmation emails with EmailJS.
- A backend or form service so registrations are not limited to one browser.
- An organiser view to export registrations as CSV.
- Real event photos for the upcoming events.
