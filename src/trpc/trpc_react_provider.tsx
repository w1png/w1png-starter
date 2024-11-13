import type { ReactNode } from "react";
import { MainTRPCReactProvider } from "./main/react";

export default function TRPCReactProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <MainTRPCReactProvider>{children}</MainTRPCReactProvider>;
}
