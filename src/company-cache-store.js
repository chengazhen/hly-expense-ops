import fs from "node:fs";
import path from "node:path";

const DEFAULT_CACHE_PATH = path.resolve(
  process.cwd(),
  "data",
  "company-cache.json",
);

export class CompanyCacheStore {
  constructor(filePath = process.env.HLY_COMPANY_CACHE_PATH || DEFAULT_CACHE_PATH) {
    this.filePath = path.resolve(filePath);
    this.ensureStore();
  }

  ensureStore() {
    const dir = path.dirname(this.filePath);
    fs.mkdirSync(dir, { recursive: true });

    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(
        this.filePath,
        JSON.stringify({ companiesByCode: {}, fetchedAt: null }, null, 2),
        "utf8",
      );
      return;
    }

    const raw = fs.readFileSync(this.filePath, "utf8").trim();
    if (!raw) {
      fs.writeFileSync(
        this.filePath,
        JSON.stringify({ companiesByCode: {}, fetchedAt: null }, null, 2),
        "utf8",
      );
      return;
    }

    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed.companiesByCode !== "object" ||
      Array.isArray(parsed.companiesByCode)
    ) {
      throw new Error(`Invalid company cache format in ${this.filePath}`);
    }
  }

  read() {
    const raw = fs.readFileSync(this.filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed.companiesByCode !== "object" ||
      Array.isArray(parsed.companiesByCode)
    ) {
      throw new Error(`Invalid company cache format in ${this.filePath}`);
    }
    return parsed;
  }

  write(data) {
    const tempPath = `${this.filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tempPath, this.filePath);
  }

  isFresh(ttlSeconds) {
    if (!ttlSeconds) return false;
    const data = this.read();
    if (!data.fetchedAt) return false;
    const ageMs = Date.now() - Date.parse(data.fetchedAt);
    return Number.isFinite(ageMs) && ageMs <= ttlSeconds * 1000;
  }

  upsertMany(companies, fetchedAt = new Date().toISOString()) {
    const data = this.read();
    for (const company of companies) {
      if (!company?.companyCode || !company?.companyOID) continue;
      data.companiesByCode[company.companyCode] = {
        companyOID: company.companyOID,
        companyCode: company.companyCode,
        companyName: company.companyName ?? null,
      };
    }
    data.fetchedAt = fetchedAt;
    this.write(data);
    return data;
  }

  getByCode(code) {
    if (!code) return null;
    const data = this.read();
    return data.companiesByCode[code] || null;
  }
}
