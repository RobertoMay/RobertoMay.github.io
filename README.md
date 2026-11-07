# Portfolio

Personal portfolio. Static HTML, CSS and JavaScript, no framework and no build step. Published to GitHub Pages on every push to `main`.

Live: https://robertomay.github.io

## Run locally

The page loads its content from `data/*.json`, so it needs a local server (opening `index.html` directly will not work):

```bash
python -m http.server 8000
```

Then open http://localhost:8000. Add `?lang=es` for Spanish.

## Where the content lives

| File | What |
| --- | --- |
| `data/i18n.json` | All site text in EN and ES, plus email, LinkedIn, GitHub links |
| `data/projects.json` | Projects |
| `assets/img/` | Project screenshots, GIFs, videos |
| `assets/cv/` | `cv-en.pdf` and `cv-es.pdf` |

## Add a project

1. Put the screenshot (and optional video) in `assets/img/`.
2. Add an entry to `data/projects.json` with both `en` and `es` text.
3. Commit and push to `main`.
4. GitHub Actions publishes it in a minute or two.

Project fields:

- `image`: screenshot, ideally `.webp` at 1280×800. Also used as the video poster. Without an image the project shows as a text-only card.
- `video`: optional `.mp4`/`.webm`. Plays muted on loop; shows controls instead when the visitor prefers reduced motion.
- `result`: leave both strings empty if there is no real metric; the row disappears.
- `links.demo` / `links.repo`: leave empty and the button is not shown.

## First deploy

1. Create a public repository named exactly `RobertoMay.github.io`.
2. Push this folder to it:
   ```bash
   git remote add origin https://github.com/RobertoMay/RobertoMay.github.io.git
   git push -u origin main
   ```
3. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Open the **Actions** tab and wait for "Deploy to GitHub Pages" to finish. The site is at `https://robertomay.github.io`.

## Before publishing

Search the repo for `TODO`; none should be left.
