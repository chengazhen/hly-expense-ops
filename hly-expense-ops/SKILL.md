---
name: hly-expense-ops
description: High-level HuiLianYi expense ops wrapper. Use whenever the user asks to view or operate HLY expense reports, approvals, or org data by business code, or mentions actions like detail, reports, create, audit-pass, audit-reject, companies, employee-create, or departments. Prefer this instead of raw MCP tool calls for any HLY expense read/write workflow.
---

# HLY Expense Ops

Use this skill when working with HuiLianYi expense APIs through a simple local CLI wrapper instead of raw MCP tool calls.

## What It Does

- Query a single expense report detail with live-first and cache fallback
- Query expense reports v2
- Create an expense report
- Audit-pass or audit-reject an expense report
- Query tenant companies
- Create an employee with the v2 API
- Query departments by time range

## Prerequisites

- Set these environment variables before use:
  - `HLY_BASE_URL`
  - `HLY_APP_ID`
  - `HLY_APP_SECRET`

## Usage

```bash
# Show help
node index.js --help

# Expense detail
node index.js --action detail --business-code BX20250401001

# Expense reports v2
node index.js --action reports --payload '{"statusList":[1001],"lastModifyStartDate":"2025-01-01 00:00:00","lastModifyEndDate":"2025-01-31 23:59:59"}'

# Create expense report
node index.js --action create --payload '{"employeeId":"E001","formCode":"FORM01"}'

# Audit pass
node index.js --action audit-pass --payload '{"businessCode":"BX20250401001","approvalTxt":"approved","operator":"system"}'
```

For a self-contained distributable runtime, build:

```bash
node scripts/build-bundle.mjs
```

Then use:

```bash
node dist/hly-expense-ops.bundle.cjs --help
```

## Action Map

- `detail`: query one expense report detail
- `reports`: query expense reports v2
- `create`: create an expense report
- `audit-pass`: approve an expense report
- `audit-reject`: reject an expense report
- `companies`: query tenant companies
- `employee-create`: create employee v2
- `departments`: select departments by date range

## Behavioral Boundaries

- `detail`: read-only. Live API first, falls back to cached detail if live call fails and cache is still fresh.
- `reports` / `companies` / `departments`: read-only live API calls.
- `create` / `audit-pass` / `audit-reject` / `employee-create`: write operations. Use intentionally and double-check payloads, as they will mutate remote state.

## Notes

- Prefer `--payload '<json>'` for complex actions
- The wrapper returns stable JSON for every action
- Errors are normalized into `{ code, error, msg, tip }`
- See [references/action-payloads.md](references/action-payloads.md) for ready-to-use payload examples
- The bundled runtime in `dist/hly-expense-ops.bundle.cjs` is the recommended artifact for copying into `.agents/skills`
