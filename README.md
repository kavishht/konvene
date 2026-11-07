# Konvene: Responsive Event Management Website

Built for the **K Explore: Web Designing** challenge. Konvene lets students browse upcoming campus events, search and filter them, read the details and register with a validated form.

**Live site:** _add your Vercel / Netlify / GitHub Pages link_
**Repository:** _add your GitHub link_

> **Data note:** the upcoming events are sample data (their dates move with today's date so registration can always be tested). The Past events tab lists real KIIT events.

## Features

- Upcoming and Past tabs; past events are greyed out with registration closed

- Hero section with a live countdown to the next event
- Event cards showing name, date, venue, art, short description and seats left
- Search by name, venue or keyword, plus category filter chips
- Detail dialog with schedule, venue, seat count and its own countdown timer
- Registration form (name, email, phone, event) with JavaScript validation and inline error messages
- Confirmation screen with a reference ID after a successful registration
- Registrations saved in **Local Storage**, with duplicate checks, seat count updates and a "My registrations" panel that supports cancelling
- Dark and light mode, remembered between visits and defaulting to the system setting
- Responsive layout for mobile, tablet and desktop
- Keyboard focus styles, labelled form fields, `aria-live` regions and `prefers-reduced-motion` support

## Tech stack

HTML5, CSS3 (custom properties, Grid, Flexbox) and vanilla JavaScript. No build step and no dependencies apart from Google Fonts.

## Project structure

```
konvene/
  index.html   page structure, dialogs, form markup
  style.css    design tokens, layout, components, responsive rules
  script.js    event data, rendering, filters, countdowns, validation, storage
  README.md
```

## How it works

- **Data:** events live in the `EVENTS` array at the top of `script.js`. Add or edit objects there to change what the site shows.
- **Rendering:** `renderGrid()` rebuilds the cards from the current search text and category.
- **Validation:** each field has a rule in the `rules` object. Fields validate on blur and re-check as the user types. Phone numbers accept 10 digit Indian mobile numbers, with or without `+91`.
- **Storage:** registrations are stored as JSON under the `konvene-registrations` key. Seats left are computed as total seats minus stored registrations for that event.
- **Theming:** colours are CSS variables. The `data-theme` attribute on `<html>` swaps the dark palette.

## Run locally

Open `index.html` in a browser, or serve the folder:

```
npx serve .
```

## Deploy

**GitHub Pages:** push to GitHub, then Settings > Pages > deploy from the `main` branch root.
**Netlify / Vercel:** import the repository. No build command is needed and the output directory is the root.

## Git workflow

```
git init
git add .
git commit -m "feat: initial Konvene event site"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

Use small commits per feature (for example `feat: search and filters`, `feat: form validation`, `style: dark mode`) so the history shows your progress.

## Possible improvements

- Replace the generated card art with real event photos
- Add a backend or form service so registrations are not limited to one browser
- Add an organiser view to export registrations as CSV
