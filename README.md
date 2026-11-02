# Scooter Media website

Static website for Scooter Media. It builds to `dist/` for Cloudflare Workers, Cloudflare Pages, GitHub Pages, and Netlify.

## Where things live

Each section of the site is its own page with its own URL, title and description:

| Page | URL | Content file |
| --- | --- | --- |
| Home | `/` | `src/pages/home.html` |
| About | `/about` | `src/pages/about.html` |
| Work | `/work` | `src/pages/work.html` |
| Clients | `/clients` | `src/pages/clients.html` |
| Crew | `/crew` | `src/pages/crew.html` |
| In the News | `/news` | `src/pages/news.html` |
| Contact | `/contact` | `src/pages/contact.html` |

- `src/layout.html`: the shared page shell (head, navigation, footer) used by every page.
- `src/pages.json`: each page's URL, title, meta description and schema type. Add a page here and in `src/pages/` to create a new one, then add it to `src/worker.js`, `wrangler.jsonc` (`run_worker_first`) and `sitemap.xml`.
- `assets/css/site.css` and `assets/js/site.js`: shared styles and scripts.

`npm run build` assembles the pages into `dist/` (`dist/index.html`, `dist/about/index.html`, …). Use absolute asset paths (`/assets/...`) in page files so they work at every URL.

## Local preview

```bash
npm run build
npm run preview
```

Open <http://localhost:8000>.

## Deploy with Cloudflare Workers

1. In Cloudflare, create a Worker connected to the `scootermedia/Scooter_India` repository and use the `main` production branch.
2. Use these build settings:

   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`

The committed `wrangler.jsonc` limits static asset uploads to `dist/`, so source files and `node_modules/` are never uploaded. No environment variables are required.

For a manual deployment, run:

```bash
npm run build
npm run deploy
```

## Deploy with Cloudflare Pages

Use `npm run build` as the build command and `dist` as the output directory. Cloudflare Pages reads the generated `_headers` file for browser caching and security headers.

## Deploy with GitHub Pages

1. Create an empty GitHub repository and push this folder to its `main` branch.
2. In the repository, open **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.

Every push to `main` then builds and deploys the site. The workflow is in `.github/workflows/deploy-pages.yml`.

## Deploy with Netlify

1. In Netlify, choose **Add new site → Import an existing project**.
2. Connect the GitHub repository.
3. Deploy the site.

Netlify reads `netlify.toml` automatically and runs:

- Build command: `npm run build`
- Publish directory: `dist`

No environment variables are required.
