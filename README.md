# Scooter Media website

Static website for Scooter Media. It has no runtime dependencies and builds to `dist/` for GitHub Pages and Netlify.

## Local preview

```bash
npm run build
npm run preview
```

Open <http://localhost:8000>.

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
