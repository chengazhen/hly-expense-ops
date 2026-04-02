import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadDotenv } from "dotenv";
import { createRuntime } from "./lib/runtime.js";
import { runAction } from "./lib/actions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadDotenv({ path: path.join(__dirname, ".env") });

const HELP_TEXT = `hly-expense-ops

Usage:
  node index.js --action <name> [options]

Actions:
  detail            Query one expense report detail
  reports           Query expense reports v2
  create            Create an expense report
  audit-pass        Audit-pass an expense report
  audit-reject      Audit-reject an expense report
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

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    if (!current.startsWith("--")) continue;
    const key = current.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function parseJsonPayload(value, flagName) {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error(`${flagName} must be a JSON object`);
    }
    return parsed;
  } catch (error) {
    throw new Error(`Invalid JSON for ${flagName}: ${error.message}`);
  }
}

function toNumber(value, fallback) {
  if (value === undefined) return fallback;
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Expected integer but got: ${value}`);
  }
  return parsed;
}

function buildInput(action, args) {
  const payload = parseJsonPayload(args.payload, "--payload");

  if (action === "detail") {
    return {
      businessCode: args["business-code"] ?? payload.businessCode,
      companyOID: args["company-oid"] ?? payload.companyOID,
      companyCode: args["company-code"] ?? payload.companyCode,
    };
  }

  if (action === "companies") {
    return {
      page: args.page !== undefined ? toNumber(args.page, 0) : payload.page,
      size: args.size !== undefined ? toNumber(args.size, 20) : payload.size,
    };
  }

  if (action === "normalize-detail") {
    return payload;
  }

  return payload;
}

function validateInput(action, input) {
  if (action === "detail" && !input.businessCode) {
    throw new Error("detail requires --business-code or payload.businessCode");
  }

  if (
    ["reports", "create", "audit-pass", "audit-reject", "employee-create", "departments"].includes(
      action,
    ) &&
    (!input || Object.keys(input).length === 0)
  ) {
    throw new Error(`${action} requires --payload with a JSON object`);
  }

  if (action === "audit-pass" || action === "audit-reject") {
    if (!input.businessCode) {
      throw new Error(`${action} requires payload.businessCode`);
    }
    if (!input.companyOID && !input.companyCode) {
      throw new Error(`${action} requires payload.companyOID or payload.companyCode`);
    }
  }
}

function buildTip(action) {
  const tips = {
    detail: "Pass --business-code BX123 or use --payload '{\"businessCode\":\"BX123\"}'.",
    reports:
      "Use --payload with statusList, lastModifyStartDate, and lastModifyEndDate.",
    create: "Use --payload with at least employeeId and formCode.",
    "audit-pass":
      "Use --payload with businessCode, companyOID or companyCode, approvalTxt, and operator.",
    "audit-reject":
      "Use --payload with businessCode, companyOID or companyCode, approvalTxt, and operator.",
    companies: "You can omit payload and use --page / --size.",
    "employee-create":
      "Use --payload with custDeptNumber, fullName, employeeID, and email.",
    departments: "Use --payload with startDate, endDate, page, and size.",
    "normalize-detail": "Use --payload with a raw HLY response object.",
  };

  return tips[action] ?? "Check --help for supported actions.";
}

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
