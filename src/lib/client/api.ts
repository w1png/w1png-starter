import { treaty } from "@elysiajs/eden";
import type { App } from "~/server/api";

let origin = "";
if (typeof window !== "undefined") {
  origin = window.location.origin;
}
export const api = treaty<App>(`${origin}`).api;
