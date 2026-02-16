import { Link, useLocation, useRouteContext } from "@tanstack/react-router";
import { ArrowLeftToLineIcon, HouseIcon, XIcon } from "lucide-react";
import Logo from "@/components/icons/logo";
import { Button } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarTrigger,
	useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export interface SidebarItem {
	label: string;
	href: string;
}

const blocks = [
	{
		items: [
			{
				label: "Дашборд",
				icon: <HouseIcon />,
				href: "/admin",
			},
		],
	},
] as const;

export function UserProfile() {
	const { session } = useRouteContext({
		strict: false,
	});
	return (
		<p className="text-muted-foreground font-medium">{session?.user.email}</p>
	);
}

export default function DashboardSidebar() {
	const sidebar = useSidebar();
	const { pathname } = useLocation();

	return (
		<>
			<div
				className={cn(
					"fixed z-40 top-0 bg-background",
					"md:hidden py-4 w-full px-4 flex justify-between items-center shadow z-50 lg:shadow-none",
				)}
			>
				<Link to="/">
					<Logo />
				</Link>
				<SidebarTrigger />
			</div>

			<Sidebar className="p-4 pr-0 bg-secondary" collapsible="icon">
				<SidebarHeader className="lg:rounded-2xl border bg-white p-4">
					<div className="flex justify-between md:hidden w-full">
						<span className="hidden lg:block">
							<UserProfile />
						</span>
						{sidebar.isMobile && (
							<SheetClose asChild>
								<Button size="icon" variant="secondary">
									<XIcon className="!size-5" />
								</Button>
							</SheetClose>
						)}
					</div>
					{/*
            					<div className="hidden md:flex justify-between w-full group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
						{sidebar.state === "collapsed" ? (
							<SidebarTrigger />
						) : (
							<>
								<Link className="size-fit" to="/">
									<Logo />
								</Link>
								<SidebarTrigger />
							</>
						)}
					</div>
          */}
				</SidebarHeader>

				<SidebarContent className="bg-white m-0 lg:mt-4 lg:rounded-2xl border">
					<div className="flex flex-col grow w-full">
						{blocks.map((block, index) => (
							<SidebarGroup
								className={cn("py-2", index !== blocks.length - 1 && "border")}
								key={`block-${index.toString()}`}
							>
								<SidebarGroupContent>
									<SidebarMenu>
										{block.items.map((item) => (
											<SidebarMenuItem
												key={`block-${index.toString()}-${item.label}`}
											>
												<SidebarMenuButton
													isActive={pathname.includes(item.href)}
													tooltip={item.label} // ← shows on hover when collapsed
												>
													<Link
														className="flex items-center gap-3"
														onClick={() => {
															if (sidebar.isMobile) {
																sidebar.setOpenMobile(false);
															}
														}}
														to={item.href}
													>
														{item.icon}
														<span className="group-data-[collapsible=icon]:hidden">
															{item.label}
														</span>
													</Link>
												</SidebarMenuButton>
											</SidebarMenuItem>
										))}
									</SidebarMenu>
								</SidebarGroupContent>
							</SidebarGroup>
						))}
					</div>

					<SidebarFooter className="w-full p-0 h-fit">
						<SidebarGroup>
							<SidebarGroupContent className="flex flex-col gap-6">
								<div className="hidden md:flex justify-between items-center h-fit">
									<UserProfile />
									<Link
										className="text-muted-foreground hover:text-foreground transition"
										to="/auth/sign-out"
									>
										<ArrowLeftToLineIcon className="!size-6" />
									</Link>
								</div>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarFooter>
				</SidebarContent>
			</Sidebar>
		</>
	);
}
