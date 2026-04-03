import path from "node:path";
import { fileURLToPath } from "node:url";
import { test, expect } from "bun:test";
import { buildInput } from "../src/cli-input.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function runCli(args) {
  const bunPath = process.argv[0] || "bun";
  const result = Bun.spawnSync({
    cmd: [bunPath, "index.js", ...args],
    cwd: projectRoot,
    stdout: "pipe",
    stderr: "pipe",
  });
  if (result.exitCode !== 0) {
    throw new Error(result.stderr.toString() || "CLI failed");
  }
  return result.stdout.toString().trim();
}

test("normalize-detail works without live API", () => {
  const output = runCli(["--action", "normalize-detail", "--payload", "{}"]);
  const parsed = JSON.parse(output);

  expect(parsed.action).toBe("normalize-detail");
  expect(parsed.ok).toBe(true);
  expect(parsed.normalized).toBeTruthy();
});

test("reports defaults statusList to pending review", () => {
  const input = buildInput("reports", { payload: "{}" });
  expect(input.statusList).toEqual([1003]);
});
