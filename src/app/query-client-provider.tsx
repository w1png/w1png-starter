"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "~/lib/client/query-client";

export default function QueryClientProviderContext({
  children,
}: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
