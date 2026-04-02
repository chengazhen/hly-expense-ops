import { buildDetailCacheKey } from "./expense-cache-store.js";
import { normalizeError } from "./errors.js";
import { normalizeExpenseReportDetail } from "./normalize.js";

export function createExpenseQueryService({ expenseClient, cacheStore, ttlSeconds }) {
  return {
    async queryDetail(params) {
      const cacheKey = buildDetailCacheKey(params);
      const now = Date.now();

      try {
        const raw = await expenseClient.getExpenseReportDetail(params);
        const fetchedAt = new Date().toISOString();
        const normalized = normalizeExpenseReportDetail(raw, params.businessCode);

        cacheStore.upsert({ key: cacheKey, raw, normalized, fetchedAt });

        return {
          ok: true,
          normalized,
          raw,
          meta: {
            source: "live",
            stale: false,
            fetchedAt,
            cacheAgeSeconds: 0,
          },
        };
      } catch (error) {
        const cached = cacheStore.getByKey(cacheKey);
        if (cached?.fetchedAt) {
          const cacheAgeSeconds = Math.floor((now - new Date(cached.fetchedAt).getTime()) / 1000);
          if (cacheAgeSeconds <= ttlSeconds) {
            return {
              ok: true,
              normalized: cached.normalized,
              raw: cached.raw,
              meta: {
                source: "cache",
                stale: true,
                fetchedAt: cached.fetchedAt,
                cacheAgeSeconds,
              },
              liveError: normalizeError(error),
            };
          }
        }

        return {
          ok: false,
          error: normalizeError(error),
          meta: {
            source: "live",
            stale: false,
            fetchedAt: null,
            cacheAgeSeconds: null,
          },
        };
      }
    },
  };
}
