import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import AdminSidebar from "./-sidebar";

export const Route = createFileRoute("/admin")({
	async beforeLoad({ context }) {
		if (context.session?.user.role !== "ADMIN") {
			throw notFound();
		}
	},
	component: AdminLayout,
});

function AdminLayout() {
	return (
		<SidebarProvider className="max-w-screen bg-secondary overflow-hidden p-4">
			<AdminSidebar />
			<main className="overflow-hidden grow flex lg:p-0">
				<Outlet />
			</main>
		</SidebarProvider>
	);
}
