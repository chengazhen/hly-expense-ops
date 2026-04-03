if (typeof globalThis.fetch !== "function") {
  throw new Error("global fetch is not available. Use Bun or Node 18+.");
}

export const defaultFetch = globalThis.fetch.bind(globalThis);
