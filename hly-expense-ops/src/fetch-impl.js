import { fetch as undiciFetch } from "undici";

export const defaultFetch =
  typeof globalThis.fetch === "function"
    ? globalThis.fetch.bind(globalThis)
    : undiciFetch;
