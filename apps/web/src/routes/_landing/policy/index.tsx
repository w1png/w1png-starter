import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_landing/policy/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_landing/policy/"!</div>;
}
