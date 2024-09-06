import type { ReactNode } from "react";
import { FileTRPCReactProvider } from "./file/react";
import { UserTRPCReactProvider } from "./user/react";

export default function TRPCReactProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <UserTRPCReactProvider>
      <FileTRPCReactProvider>{children}</FileTRPCReactProvider>
    </UserTRPCReactProvider>
  );
}
