import Loader from "@/components/loader";
import { authClient } from "@/lib/auth-client";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/auth/sign-out")({
	component: SignOutPage,
});

function SignOutPage() {
	useEffect(() => {
		authClient.signOut();
	}, []);

	return <Loader />;
}
