import Loader from "@/components/loader";
import { authClient } from "@/lib/auth-client";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/auth/sign-out")({
	component: SignOutPage,
});

function SignOutPage() {
	const navigate = Route.useNavigate();

	useEffect(() => {
		authClient.signOut().then(() =>
			navigate({
				to: "/auth/sign-in",
			}),
		);
	}, []);

	return <Loader />;
}
