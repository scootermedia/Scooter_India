import { copyFile, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "dist");

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await copyFile(resolve(root, "index.html"), resolve(output, "index.html"));
await copyFile(resolve(root, "404.html"), resolve(output, "404.html"));
await copyFile(resolve(root, "_headers"), resolve(output, "_headers"));

const html = await readFile(resolve(output, "index.html"), "utf8");
const localReferences = [...html.matchAll(/(?:src|href)="(assets\/[^"?#]+)(?:[?#][^"]*)?"/g)]
  .map((match) => match[1]);

for (const reference of new Set(localReferences)) {
  const source = resolve(root, reference);
  const destination = resolve(output, reference);
  await stat(source);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

await writeFile(resolve(output, ".nojekyll"), "");
console.log(`Built ${new Set(localReferences).size} referenced assets into dist/.`);
