# HLY Expense Ops

High-level CLI and skill wrapper for HuiLianYi (HLY) expense operations. This package sits on top of the HLY MCP runtime and provides a stable JSON output for common read and write actions.

## Features

- Query expense report detail (live-first with cache fallback)
- Query expense reports v2
- Create expense reports
- Audit pass / reject
- Query tenant companies
- Create employees (v2)
- Query departments by date range
- Normalize raw detail payloads

## Requirements

- Node.js `^20.0.0` or `^22.0.0`
- Environment variables:
  - `HLY_BASE_URL`
  - `HLY_APP_ID`
  - `HLY_APP_SECRET`

Optional:
- `HLY_TOKEN_PATH`
- `HLY_EXPENSE_DETAIL_PATH`
- `HLY_EXPENSE_CREATE_PATH`
- `HLY_EXPENSE_REPORT_V2_PATH`
- `HLY_EXPENSE_AUDIT_PASS_PATH`
- `HLY_EXPENSE_AUDIT_REJECT_PATH`
- `HLY_COMPANY_BY_TENANT_PATH`
- `HLY_EMPLOYEE_CREATE_V2_PATH`
- `HLY_DEPARTMENT_SELECT_PATH`
- `HLY_TIMEOUT_MS`
- `HLY_RETRY_COUNT`
- `HLY_CACHE_TTL_SECONDS`
- `HLY_EXPENSE_DETAIL_CACHE_PATH`
- `HLY_HTTP_DEBUG`

## Install

```bash
npm install
```

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
node index.js --action audit-pass --payload '{"businessCode":"BX20250401001","companyOID":"your-company-oid","approvalTxt":"approved","operator":"system"}'

# Audit reject
node index.js --action audit-reject --payload '{"businessCode":"BX20250401001","companyOID":"your-company-oid","approvalTxt":"missing receipt","operator":"system"}'

# Normalize a raw detail object
node index.js --action normalize-detail --payload '{}'
```

## Action Map

- `detail`: query one expense report detail (live-first, cache fallback)
- `reports`: query expense reports v2
- `create`: create an expense report
- `audit-pass`: approve an expense report
- `audit-reject`: reject an expense report
- `companies`: query tenant companies
- `employee-create`: create employee v2
- `departments`: select departments by date range
- `normalize-detail`: normalize a raw detail payload

## Behavioral Boundaries

- Read-only: `detail`, `reports`, `companies`, `departments`, `normalize-detail`
- Write operations: `create`, `audit-pass`, `audit-reject`, `employee-create`
  - These mutate remote state. Double-check payloads before running.

## Payload Examples

See `references/action-payloads.md` for ready-to-use JSON payloads.

## Build

```bash
node scripts/build-bundle.mjs
```

Outputs a self-contained runtime in `hly-expense-ops/` that includes source and references.

## Tests

```bash
node --test
```

## Eval Prompts

Skill eval prompts live at `evals/evals.json`.
