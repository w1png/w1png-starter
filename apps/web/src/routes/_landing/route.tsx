import { createFileRoute, Outlet } from "@tanstack/react-router";
import Navbar from "./-navbar";
import Footer from "./-footer";

export const Route = createFileRoute("/_landing")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<Navbar />
			<div className="min-h-[90vh]">
				<Outlet />
			</div>
			<Footer />
		</>
	);
}
