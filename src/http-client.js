import { HttpRequestError } from "./errors.js";
import { defaultFetch } from "./fetch-impl.js";

function isRetryableStatus(status) {
  return status === 429 || status >= 500;
}

function buildUrl(baseUrl, path, query = {}) {
  const base = new URL(baseUrl);
  const basePath = base.pathname.replace(/\/+$/, "");
  const relPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base.origin}${basePath}${relPath}`);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}

function redactHeaders(headers) {
  const output = {};
  for (const [key, value] of Object.entries(headers || {})) {
    if (key.toLowerCase() === "authorization" && typeof value === "string") {
      const [scheme] = value.split(" ");
      output[key] = scheme ? `${scheme} [REDACTED]` : "[REDACTED]";
    } else {
      output[key] = value;
    }
  }
  return output;
}

function logHttpEvent(event) {
  if (process.env.HLY_HTTP_DEBUG !== "1") {
    return;
  }
  try {
    console.error("[http]", JSON.stringify(event));
  } catch {
    console.error("[http] event", event);
  }
}

async function parseResponseBody(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export class HttpClient {
  constructor({ timeoutMs = 30000, retryCount = 1, fetchImpl = defaultFetch } = {}) {
    this.timeoutMs = timeoutMs;
    this.retryCount = retryCount;
    this.fetchImpl = fetchImpl;
  }

  async request({
    baseUrl,
    path,
    method = "GET",
    headers = {},
    query,
    body,
    retryCount,
  }) {
    const retries = retryCount ?? this.retryCount;
    const upperMethod = method.toUpperCase();
    const canRetry = upperMethod === "GET" || upperMethod === "HEAD";

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
      const url = buildUrl(baseUrl, path, query);

      try {
        logHttpEvent({
          type: "request",
          method: upperMethod,
          url: url.toString(),
          headers: redactHeaders(headers),
          hasBody: body !== undefined && body !== null,
          attempt,
        });

        const response = await this.fetchImpl(url, {
          method: upperMethod,
          headers,
          body,
          signal: controller.signal,
        });

        const parsedBody = await parseResponseBody(response);
        logHttpEvent({
          type: "response",
          method: upperMethod,
          url: url.toString(),
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: parsedBody,
          attempt,
        });

        if (!response.ok) {
          const httpError = new HttpRequestError(
            `Request failed with status ${response.status}`,
            {
              status: response.status,
              body: parsedBody,
              url: url.toString(),
              code: "HLY_HTTP_ERROR",
            },
          );

          if (canRetry && attempt < retries && isRetryableStatus(response.status)) {
            continue;
          }
          throw httpError;
        }

        return parsedBody;
      } catch (error) {
        if (error?.name === "AbortError") {
          if (canRetry && attempt < retries) {
            continue;
          }
        }

        if (!(error instanceof HttpRequestError) && canRetry && attempt < retries) {
          continue;
        }

        throw error;
      } finally {
        clearTimeout(timeout);
      }
    }

    throw new Error("Unexpected request loop termination");
  }
}
