# Scooter Media website

Static website for Scooter Media. It builds to `dist/` for Cloudflare Workers, Cloudflare Pages, GitHub Pages, and Netlify.

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
