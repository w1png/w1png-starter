"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/client/api";
import { TreatyError } from "~/lib/shared/types/error";

export default function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await api.user.session.get();
      if (res.error) throw new TreatyError(res.error);
      return res.data;
    },
  });
}
