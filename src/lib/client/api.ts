import { treaty } from "@elysiajs/eden";
import { store } from "~/app/store";
import type { App } from "~/server/api";

let origin = "";
if (typeof window !== "undefined") {
  origin = window.origin;
}

export const api = treaty<App>(`${origin}`, {
  headers(_, options) {
    const { initDataRaw, startParam } = store.state;
    const headers = new Headers(options.headers);
    headers.set("x-init-data", initDataRaw!);
    startParam ? headers.set("x-start-param", startParam) : undefined;
    return headers;
  },
}).api;
