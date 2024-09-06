import "server-only";

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { headers } from "next/headers";
import { cache } from "react";

import { type Router, createCaller } from "~/server/api/file";
import { createTRPCContext } from "~/server/api/trpc";
import { createQueryClient } from "../query-client";

const createContext = cache(() => {
  const heads = new Headers(headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
});

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

export const { trpc: serverApi, HydrateClient } =
  createHydrationHelpers<Router>(caller, getQueryClient);
