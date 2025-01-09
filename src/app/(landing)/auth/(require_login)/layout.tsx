import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { auth } from "~/server/auth/auth";

export default async function RequireLoginRedirect({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  console.log(session);

  if (session) redirect("/");

  return children;
}
