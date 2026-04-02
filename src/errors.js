export class HttpRequestError extends Error {
  constructor(message, { status = null, body = null, url = null, code = null } = {}) {
    super(message);
    this.name = "HttpRequestError";
    this.status = status;
    this.body = body;
    this.url = url;
    this.code = code;
  }
}

export function normalizeError(error) {
  if (error instanceof HttpRequestError) {
    return {
      type: "http_error",
      code: error.code || "HLY_HTTP_ERROR",
      status: error.status,
      message: error.message,
      body: error.body,
    };
  }

  if (error?.name === "AbortError") {
    return {
      type: "timeout",
      code: "HLY_TIMEOUT",
      status: null,
      message: "Request timed out",
      body: null,
    };
  }

  return {
    type: "unknown",
    code: "HLY_UNKNOWN_ERROR",
    status: null,
    message: error instanceof Error ? error.message : String(error),
    body: null,
  };
}
