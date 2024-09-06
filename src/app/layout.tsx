import "~/styles/globals.css";

import type { Metadata } from "next";

import { Inter } from "next/font/google";
import TRPCReactProvider from "~/trpc/trpc_react_provider";

const main_font = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-main",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gramobot - начни продавать за 10 минут!",
  description: "Открой магазин в телеграм за 10 минут!",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${main_font.variable} font-main`}
    >
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
