"use client";
import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import {
  miniApp,
  init,
  settingsButton,
  viewport,
  retrieveLaunchParams,
} from "@telegram-apps/sdk-react";

import { Toaster } from "~/components/ui/sonner";
import QueryClientProviderContext from "./query-client-provider";
import { useEffect, useState } from "react";
import { store } from "./store";
import { SessionProvider } from "./session";

const main_font = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-main",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${main_font.variable} font-main`}>
      <body>
        <NuqsAdapter>
          <QueryClientProviderContext>
            <TelegramLayout>{children}</TelegramLayout>
          </QueryClientProviderContext>
          <Toaster />
        </NuqsAdapter>
      </body>
    </html>
  );
}

function TelegramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!window) return;
    init();
    miniApp.mount();
    settingsButton.mount();
    viewport.mount();
    viewport.expand();
    const launchParams = retrieveLaunchParams();
    const { initDataRaw, startParam } = launchParams;
    if (initDataRaw) {
      store.setState((old) => ({
        ...old,
        initDataRaw,
        startParam,
      }));
      setLoading(false);
    }
  }, []);

  if (!store.state.initDataRaw && loading) {
    return null;
  }

  return <SessionProvider>{children}</SessionProvider>;
}
