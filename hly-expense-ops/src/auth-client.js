import { HttpRequestError } from "./errors.js";
import { defaultFetch } from "./fetch-impl.js";

function parseTokenPayload(payload) {
  const accessToken = payload?.access_token || payload?.data?.access_token;
  const expiresIn = payload?.expires_in || payload?.data?.expires_in || 7200;

  if (!accessToken) {
    throw new Error("Token response missing access_token");
  }

  return { accessToken, expiresIn: Number(expiresIn) || 7200 };
}

export class AuthClient {
  constructor({ config, fetchImpl = defaultFetch }) {
    this.config = config;
    this.fetchImpl = fetchImpl;
    this.accessToken = null;
    this.expiresAt = 0;
    this.refreshPromise = null;
  }

  isTokenValid() {
    return Boolean(this.accessToken) && Date.now() < this.expiresAt - 30_000;
  }

  async getAccessToken(forceRefresh = false) {
    if (!forceRefresh && this.isTokenValid()) {
      return this.accessToken;
    }

    if (!this.refreshPromise) {
      this.refreshPromise = this.fetchToken().finally(() => {
        this.refreshPromise = null;
      });
    }

    return this.refreshPromise;
  }

  async fetchToken() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.hlyTimeoutMs);

    try {
      const basic = Buffer.from(
        `${this.config.hlyAppId}:${this.config.hlyAppSecret}`,
        "utf8",
      ).toString("base64");

      const response = await this.fetchImpl(
        new URL(this.config.hlyTokenPath, this.config.hlyBaseUrl),
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${basic}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: "grant_type=client_credentials&scope=write",
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        const text = await response.text();
        throw new HttpRequestError(`Token request failed with status ${response.status}`, {
          status: response.status,
          body: text,
          code: "HLY_AUTH_FAILED",
        });
      }

      const payload = await response.json();
      const { accessToken, expiresIn } = parseTokenPayload(payload);

      this.accessToken = accessToken;
      this.expiresAt = Date.now() + expiresIn * 1000;
      return this.accessToken;
    } finally {
      clearTimeout(timeout);
    }
  }
}
