import { redirect } from "next/navigation";
import type React from "react";
import { getServerAuthSession } from "~/server/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  if (session?.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  return children;
}
