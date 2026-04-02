import fs from "node:fs";
import path from "node:path";

const DEFAULT_CACHE_PATH = path.resolve(
  process.cwd(),
  "data",
  "expense-report-detail-cache.json",
);

export function buildDetailCacheKey({ businessCode, companyOID, companyCode }) {
  const tenantPart = companyOID || companyCode || "default";
  return `detail:${businessCode}:${tenantPart}`;
}

export class ExpenseDetailCacheStore {
  constructor(filePath = process.env.HLY_EXPENSE_DETAIL_CACHE_PATH || DEFAULT_CACHE_PATH) {
    this.filePath = path.resolve(filePath);
    this.ensureStore();
  }

  ensureStore() {
    const dir = path.dirname(this.filePath);
    fs.mkdirSync(dir, { recursive: true });

    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify({ details: {} }, null, 2), "utf8");
      return;
    }

    const raw = fs.readFileSync(this.filePath, "utf8").trim();
    if (!raw) {
      fs.writeFileSync(this.filePath, JSON.stringify({ details: {} }, null, 2), "utf8");
      return;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.details !== "object" || Array.isArray(parsed.details)) {
      throw new Error(`Invalid cache format in ${this.filePath}`);
    }
  }

  read() {
    const raw = fs.readFileSync(this.filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.details !== "object" || Array.isArray(parsed.details)) {
      throw new Error(`Invalid cache format in ${this.filePath}`);
    }
    return parsed;
  }

  write(data) {
    const tempPath = `${this.filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tempPath, this.filePath);
  }

  upsert({ key, raw, normalized, fetchedAt }) {
    const data = this.read();
    data.details[key] = {
      fetchedAt,
      raw,
      normalized,
    };
    this.write(data);
    return data.details[key];
  }

  getByKey(key) {
    const data = this.read();
    return data.details[key] || null;
  }
}
