import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type React from "react";
import { auth } from "~/server/auth/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role !== "admin") {
    redirect("/auth/signin");
  }

  return children;
}
