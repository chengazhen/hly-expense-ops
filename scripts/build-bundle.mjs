import { cp, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const skillRoot = path.resolve(__dirname, "..");
const distDir = path.join(skillRoot, "hly-expense-ops");

const entry = path.join(skillRoot, "index.js");
const outfile = path.join(distDir, "index.js");
const copyTargets = [
  "agents",
  "data",
  "references",
  "src",
  ".env.example",
  "SKILL.md",
  "package.json",
];

await mkdir(distDir, { recursive: true });

await build({
  entryPoints: [entry],
  outfile,
  bundle: true,
  platform: "node",
  format: "esm",
  target: ["node20"],
  banner: {
    js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);',
  },
  define: {
    "process.env.NODE_ENV": "\"production\"",
  },
});

await Promise.all(
  copyTargets.map((target) =>
    cp(path.join(skillRoot, target), path.join(distDir, target), {
      recursive: true,
      force: true,
    }),
  ),
);

console.log(`Built ${outfile} and copied assets to ${distDir}`);
