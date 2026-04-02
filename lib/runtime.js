import { AuthClient } from "../src/auth-client.js";
import { loadConfig } from "../src/config.js";
import { CompanyCacheStore } from "../src/company-cache-store.js";
import { ExpenseDetailCacheStore } from "../src/expense-cache-store.js";
import { createExpenseQueryService } from "../src/expense-query-service.js";
import { HlyExpenseClient } from "../src/hly-expense-client.js";
import { HttpClient } from "../src/http-client.js";

export function createRuntime() {
  const config = loadConfig();
  const cacheStore = new ExpenseDetailCacheStore(config.cacheFilePath);
  const companyCacheStore = new CompanyCacheStore(config.companyCacheFilePath);
  const httpClient = new HttpClient({
    timeoutMs: config.hlyTimeoutMs,
    retryCount: config.hlyRetryCount,
  });
  const authClient = new AuthClient({ config });
  const expenseClient = new HlyExpenseClient({
    config,
    httpClient,
    authClient,
  });
  const expenseService = createExpenseQueryService({
    expenseClient,
    cacheStore,
    ttlSeconds: config.hlyCacheTtlSeconds,
  });

  return {
    config,
    companyCacheStore,
    expenseClient,
    expenseService,
  };
}
