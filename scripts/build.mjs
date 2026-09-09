import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "dist");

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(resolve(root, "assets"), resolve(output, "assets"), { recursive: true });
await cp(resolve(root, "index.html"), resolve(output, "index.html"));
await cp(resolve(root, "_headers"), resolve(output, "_headers"));

const html = await readFile(resolve(output, "index.html"), "utf8");
const localReferences = [...html.matchAll(/(?:src|href)="(assets\/[^"?#]+)(?:[?#][^"]*)?"/g)]
  .map((match) => match[1]);

for (const reference of new Set(localReferences)) {
  await readFile(resolve(output, reference));
}

await writeFile(resolve(output, ".nojekyll"), "");
console.log(`Built ${localReferences.length} local asset references into dist/.`);
