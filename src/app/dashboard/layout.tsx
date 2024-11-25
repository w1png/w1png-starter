import { redirect } from "next/navigation";
import type React from "react";
import { auth } from "~/server/auth";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();

	if (!session?.user) {
		redirect("/auth/signin");
	}

	return children;
}
