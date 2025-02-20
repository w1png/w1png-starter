"use client";

import { ReactNode } from "react";
import { api } from "~/lib/client/api";
import { useQuery } from "@tanstack/react-query";

export function SessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { data: session } = useQuery({
    queryKey: ["session"],
    async queryFn() {
      const session = (await api.user.index.get()).data;
      return session;
    },
  });

  if (!session) {
    return <h1>Загрузка</h1>;
  }

  return children;
}
