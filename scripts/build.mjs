import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "dist");
const origin = "https://www.scootermedia.co";
const dateModified = "2026-11-02";

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

const staticFiles = [
  "404.html",
  "_headers",
  "robots.txt",
  "sitemap.xml",
  "llms.txt",
  "googleb41e1fc39ebed2e3.html",
];

for (const file of staticFiles) {
  await copyFile(resolve(root, file), resolve(output, file));
}

// Short content hashes so browsers pick up CSS/JS changes despite long caching.
const version = async (file) =>
  createHash("sha256").update(await readFile(resolve(root, file))).digest("hex").slice(0, 10);

const escapeHtml = (text) =>
  text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const layout = await readFile(resolve(root, "src/layout.html"), "utf8");
const pages = JSON.parse(await readFile(resolve(root, "src/pages.json"), "utf8"));
const cssVersion = await version("assets/css/site.css");
const jsVersion = await version("assets/js/site.js");
const generated = [];

for (const page of pages) {
  const url = page.route === "/" ? `${origin}/` : `${origin}${page.route}`;
  const content = await readFile(resolve(root, "src/pages", page.source), "utf8");

  const webPage = {
    "@type": page.schemaType,
    "@id": `${url}#webpage`,
    url,
    name: page.title,
    description: page.description,
    dateModified,
    isPartOf: { "@id": `${origin}/#website` },
    about: { "@id": `${origin}/#organization` },
    inLanguage: "en-IN",
  };
  const schema = JSON.stringify(webPage, null, 2).replace(/\n/g, "\n        ");

  const values = {
    TITLE: escapeHtml(page.title),
    DESCRIPTION: escapeHtml(page.description),
    SOCIAL_DESCRIPTION: escapeHtml(page.socialDescription ?? page.description),
    URL: url,
    WEBPAGE_SCHEMA: schema,
    BODY_CLASS: page.route === "/" ? "page-home" : "page-inner",
    CSS_VERSION: cssVersion,
    JS_VERSION: jsVersion,
    CONTENT: content.trimEnd(),
  };

  let html = layout.replace(/\{\{([A-Z_]+)\}\}/g, (match, key) => {
    if (!(key in values)) throw new Error(`Unknown placeholder ${match} in src/layout.html`);
    return values[key];
  });

  // Mark the current page in the main navigation.
  if (page.route !== "/") {
    html = html.replace(
      `<a href="${page.route}">`,
      `<a href="${page.route}" aria-current="page">`,
    );
  }

  const destination =
    page.route === "/" ? resolve(output, "index.html") : resolve(output, page.route.slice(1), "index.html");
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, html);
  generated.push(html);
}

// Copy only the assets the pages actually reference.
const localReferences = generated.flatMap((html) =>
  [...html.matchAll(/(?:src|href|data-lightbox-src)="\/(assets\/[^"?#]+)(?:[?#][^"]*)?"/g)].map((match) => match[1]),
);

for (const reference of new Set(localReferences)) {
  const source = resolve(root, reference);
  const destination = resolve(output, reference);
  await stat(source);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

await writeFile(resolve(output, ".nojekyll"), "");
console.log(`Built ${pages.length} pages and ${new Set(localReferences).size} referenced assets into dist/.`);
