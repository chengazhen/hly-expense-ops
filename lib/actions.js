import { normalizeExpenseReportDetail } from "../src/normalize.js";

function summarizeReports(result) {
  const rows =
    result?.data?.rows ??
    result?.data?.items ??
    result?.rows ??
    result?.items ??
    [];

  return {
    count: Array.isArray(rows) ? rows.length : 0,
    businessCodes: Array.isArray(rows)
      ? rows
          .map((item) => item?.businessCode ?? item?.expenseReportCode ?? item?.code)
          .filter(Boolean)
      : [],
  };
}

function summarizeCompanies(result) {
  const rows =
    result?.data?.rows ??
    result?.data?.items ??
    result?.rows ??
    result?.items ??
    [];

  return {
    count: Array.isArray(rows) ? rows.length : 0,
    companies: Array.isArray(rows)
      ? rows.map((item) => ({
          companyOID: item?.companyOID ?? item?.oid ?? null,
          companyCode: item?.companyCode ?? item?.code ?? null,
          companyName: item?.companyName ?? item?.name ?? null,
        }))
      : [],
  };
}

function summarizeDepartments(result) {
  const rows =
    result?.data?.rows ??
    result?.data?.items ??
    result?.rows ??
    result?.items ??
    [];

  return {
    count: Array.isArray(rows) ? rows.length : 0,
    departments: Array.isArray(rows)
      ? rows.map((item) => ({
          deptId: item?.deptId ?? item?.id ?? null,
          deptCode: item?.deptCode ?? item?.code ?? null,
          deptName: item?.deptName ?? item?.name ?? null,
        }))
      : [],
  };
}

function extractRows(result) {
  return (
    result?.data?.rows ??
    result?.data?.items ??
    result?.rows ??
    result?.items ??
    []
  );
}

function normalizeCompanyRows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map((item) => ({
    companyOID: item?.companyOID ?? item?.oid ?? null,
    companyCode: item?.companyCode ?? item?.code ?? null,
    companyName: item?.companyName ?? item?.name ?? null,
  }));
}

async function refreshCompanyCache(runtime) {
  const pageSize = 200;
  const maxPages = 20;
  const collected = [];

  for (let page = 0; page < maxPages; page += 1) {
    const raw = await runtime.expenseClient.queryCompaniesByTenant({
      page,
      size: pageSize,
    });
    const rows = extractRows(raw);
    const normalized = normalizeCompanyRows(rows);
    collected.push(...normalized);
    if (!Array.isArray(rows) || rows.length < pageSize) break;
  }

  runtime.companyCacheStore.upsertMany(collected);
  return collected;
}

async function ensureCompanyOID(runtime, input) {
  if (input.companyOID) return input;

  if (!input.companyCode) {
    throw new Error("audit requires companyOID or companyCode");
  }

  const cacheStore = runtime.companyCacheStore;
  const ttlSeconds = runtime.config.hlyCacheTtlSeconds;

  if (cacheStore.isFresh(ttlSeconds)) {
    const cached = cacheStore.getByCode(input.companyCode);
    if (cached?.companyOID) {
      return { ...input, companyOID: cached.companyOID };
    }
  }

  await refreshCompanyCache(runtime);
  const refreshed = cacheStore.getByCode(input.companyCode);
  if (refreshed?.companyOID) {
    return { ...input, companyOID: refreshed.companyOID };
  }

  throw new Error(
    `Unable to resolve companyOID for companyCode ${input.companyCode}`,
  );
}

export async function runAction(runtime, action, input) {
  switch (action) {
    case "detail": {
      const result = await runtime.expenseService.queryDetail(input);
      return {
        action,
        ok: result.ok,
        normalized: result.normalized ?? null,
        meta: result.meta,
        liveError: result.liveError ?? null,
        raw: result.raw ?? result.error ?? null,
      };
    }
    case "reports": {
      const raw = await runtime.expenseClient.queryExpenseReportsV2(input);
      return {
        action,
        ok: true,
        summary: summarizeReports(raw),
        raw,
      };
    }
    case "create": {
      const raw = await runtime.expenseClient.createExpenseReport(input);
      return {
        action,
        ok: true,
        businessCode:
          raw?.data?.businessCode ?? raw?.businessCode ?? raw?.data?.code ?? null,
        raw,
      };
    }
    case "audit-pass": {
      const resolvedInput = await ensureCompanyOID(runtime, input);
      const raw = await runtime.expenseClient.auditPassExpenseReport(resolvedInput);
      return {
        action,
        ok: true,
        businessCode: resolvedInput.businessCode ?? null,
        raw,
      };
    }
    case "audit-reject": {
      const resolvedInput = await ensureCompanyOID(runtime, input);
      const raw = await runtime.expenseClient.auditRejectExpenseReport(resolvedInput);
      return {
        action,
        ok: true,
        businessCode: resolvedInput.businessCode ?? null,
        raw,
      };
    }
    case "invoice-reject": {
      const raw = await runtime.expenseClient.rejectExpenseReportInvoice(input);
      return {
        action,
        ok: true,
        businessCode: input.businessCode ?? null,
        raw,
      };
    }
    case "approvals-pass": {
      const raw = await runtime.expenseClient.approvalsPass(input);
      return {
        action,
        ok: true,
        businessCode: input.businessCode ?? null,
        raw,
      };
    }
    case "companies": {
      const raw = await runtime.expenseClient.queryCompaniesByTenant({
        page: input.page ?? 0,
        size: input.size ?? 20,
      });
      return {
        action,
        ok: true,
        summary: summarizeCompanies(raw),
        raw,
      };
    }
    case "employee-create": {
      const raw = await runtime.expenseClient.createEmployeeV2(input);
      return {
        action,
        ok: true,
        employeeID: input.employeeID ?? null,
        raw,
      };
    }
    case "departments": {
      const raw = await runtime.expenseClient.selectDepartment(input);
      return {
        action,
        ok: true,
        summary: summarizeDepartments(raw),
        raw,
      };
    }
    case "normalize-detail": {
      return {
        action,
        ok: true,
        normalized: normalizeExpenseReportDetail(input.raw ?? input, input.businessCode ?? null),
      };
    }
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}
