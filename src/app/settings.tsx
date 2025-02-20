"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { settingsButton } from "@telegram-apps/sdk-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "~/lib/client/api";

export default function useSettingsButton() {
  const router = useRouter();
  const { data: session } = useSuspenseQuery({
    queryKey: ["session"],
    async queryFn() {
      return (await api.user.index.get()).data;
    },
  });

  useEffect(() => {
    if (window && settingsButton && session?.user.role === "admin") {
      settingsButton.onClick(() => {
        router.push("/admin");
      });
      settingsButton.show();
      return () => settingsButton.hide();
    }
  }, [session]);

  return null;
}
