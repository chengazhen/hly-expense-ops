const DEFAULTS = {
  tokenPath: "/oauth/token",
  expenseDetailPath: "/api/open/expenseReport/detail",
  expenseCreatePath: "/api/open/expenseReport/create",
  expenseReportV2Path: "/api/open/expenseReport/v2",
  expenseAuditPassPath: "/api/open/expenseReport/audit/pass",
  expenseAuditRejectPath: "/api/open/expenseReport/audit/reject",
  companyByTenantPath: "/api/open/company/tenant/all",
  employeeCreateV2Path: "/api/open/user/create/v2",
  departmentSelectPath: "/api/open/department",
  timeoutMs: 30000,
  retryCount: 1,
  cacheTtlSeconds: 86400,
};

function parseIntEnv(name, fallback) {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new Error(`Invalid ${name}: expected non-negative integer`);
  }
  return parsed;
}

export function loadConfig() {
  const baseUrl = process.env.HLY_BASE_URL?.trim();
  const appId = process.env.HLY_APP_ID?.trim();
  const appSecret = process.env.HLY_APP_SECRET?.trim();

  const missing = [];
  if (!baseUrl) missing.push("HLY_BASE_URL");
  if (!appId) missing.push("HLY_APP_ID");
  if (!appSecret) missing.push("HLY_APP_SECRET");

  if (missing.length > 0) {
    throw new Error(`Missing required env: ${missing.join(", ")}`);
  }

  return {
    hlyBaseUrl: baseUrl,
    hlyAppId: appId,
    hlyAppSecret: appSecret,
    hlyTokenPath: process.env.HLY_TOKEN_PATH?.trim() || DEFAULTS.tokenPath,
    hlyExpenseDetailPath:
      process.env.HLY_EXPENSE_DETAIL_PATH?.trim() || DEFAULTS.expenseDetailPath,
    hlyExpenseCreatePath:
      process.env.HLY_EXPENSE_CREATE_PATH?.trim() || DEFAULTS.expenseCreatePath,
    hlyExpenseReportV2Path:
      process.env.HLY_EXPENSE_REPORT_V2_PATH?.trim() || DEFAULTS.expenseReportV2Path,
    hlyExpenseAuditPassPath:
      process.env.HLY_EXPENSE_AUDIT_PASS_PATH?.trim() || DEFAULTS.expenseAuditPassPath,
    hlyExpenseAuditRejectPath:
      process.env.HLY_EXPENSE_AUDIT_REJECT_PATH?.trim() || DEFAULTS.expenseAuditRejectPath,
    hlyCompanyByTenantPath:
      process.env.HLY_COMPANY_BY_TENANT_PATH?.trim() || DEFAULTS.companyByTenantPath,
    hlyEmployeeCreateV2Path:
      process.env.HLY_EMPLOYEE_CREATE_V2_PATH?.trim() || DEFAULTS.employeeCreateV2Path,
    hlyDepartmentSelectPath:
      process.env.HLY_DEPARTMENT_SELECT_PATH?.trim() || DEFAULTS.departmentSelectPath,
    hlyTimeoutMs: parseIntEnv("HLY_TIMEOUT_MS", DEFAULTS.timeoutMs),
    hlyRetryCount: parseIntEnv("HLY_RETRY_COUNT", DEFAULTS.retryCount),
    hlyCacheTtlSeconds: parseIntEnv("HLY_CACHE_TTL_SECONDS", DEFAULTS.cacheTtlSeconds),
    cacheFilePath: process.env.HLY_EXPENSE_DETAIL_CACHE_PATH,
  };
}
