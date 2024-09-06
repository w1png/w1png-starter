import type { ReactNode } from "react";
import { FileTRPCReactProvider } from "./file/react";
import { MainTRPCReactProvider } from "./main/react";
import { UserTRPCReactProvider } from "./user/react";

export default function TRPCReactProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <UserTRPCReactProvider>
      <FileTRPCReactProvider>
        <MainTRPCReactProvider>{children}</MainTRPCReactProvider>
      </FileTRPCReactProvider>
    </UserTRPCReactProvider>
  );
}
