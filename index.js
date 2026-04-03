import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRuntime } from "./lib/runtime.js";
import { runAction } from "./lib/actions.js";
import { buildInput, buildTip, parseArgs, validateInput } from "./src/cli-input.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HELP_TEXT = `hly-expense-ops

Usage:
  bun index.js --action <name> [options]

Actions:
  detail            Query one expense report detail
  reports           Query expense reports v2
  create            Create an expense report
  audit-pass        Audit-pass an expense report
  audit-reject      Audit-reject an expense report
  invoice-reject    Reject expense report invoices
  approvals-pass    Generic approvals pass
  companies         Query tenant companies
  employee-create   Create employee v2
  departments       Query departments
  normalize-detail  Normalize a raw expense detail object

Options:
  --action <name>           Action name
  --payload <json>          JSON object payload for the action
  --business-code <value>   Business code for detail
  --company-oid <value>     Optional company OID
  --company-code <value>    Optional company code
  --page <number>           Page index
  --size <number>           Page size
  --help                    Show help
`;

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.action) {
    process.stdout.write(HELP_TEXT);
    return;
  }

  const action = String(args.action);

  try {
    const input = buildInput(action, args);
    validateInput(action, input);

    const runtime = action === "normalize-detail" ? null : createRuntime();
    const result = await runAction(runtime, action, input);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(
      `${JSON.stringify(
        {
          code: 1,
          error: error.message,
          msg: error.message,
          tip: buildTip(action),
        },
        null,
        2,
      )}\n`,
    );
    process.exitCode = 1;
  }
}

main();
