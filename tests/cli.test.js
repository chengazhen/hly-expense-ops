import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function runCli(args) {
  const output = execFileSync(process.execPath, ["index.js", ...args], {
    cwd: projectRoot,
    encoding: "utf8",
  });
  return output.trim();
}

test("normalize-detail works without live API", () => {
  const output = runCli(["--action", "normalize-detail", "--payload", "{}"]);
  const parsed = JSON.parse(output);

  assert.equal(parsed.action, "normalize-detail");
  assert.equal(parsed.ok, true);
  assert.ok(parsed.normalized);
});
