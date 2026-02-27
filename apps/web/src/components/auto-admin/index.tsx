/** biome-ignore-all lint/correctness/useHookAtTopLevel: temp */
import { orpc } from "@/lib/orpc";
import { useQuery } from "@tanstack/react-query";
import {
	type AnyRoute,
	type FileRoute,
	type FileRoutesByPath,
	type RouteConstraints,
	useLoaderData,
} from "@tanstack/react-router";
import type { ZodObject } from "zod/v4";
import type { AdminRouterKeys, CreateInput } from "./types";
import {
	Dashboard,
	DashboardContent,
	DashboardHeader,
	DashboardTitle,
} from "../ui/dashboard";
import { DataTable } from "../ui/data-table";
import { AutoAdminCreateUpdate } from "./create-update";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import { AutoAdminDelete } from "./delete";

export default function AutoAdmin<
	R extends AdminRouterKeys,
	S extends ZodObject,
	TFilePath extends keyof FileRoutesByPath,
	TParentRoute extends AnyRoute = FileRoutesByPath[TFilePath]["parentRoute"],
	TId extends RouteConstraints["TId"] = FileRoutesByPath[TFilePath]["id"],
	TPath extends RouteConstraints["TPath"] = FileRoutesByPath[TFilePath]["path"],
	TFullPath extends
		RouteConstraints["TFullPath"] = FileRoutesByPath[TFilePath]["fullPath"],
>({
	schema,
	router: routerKey,
	header,
}: {
	header: string;
	router: R;
	schema: S & {
		_output: CreateInput<R> &
			(
				| {
						title: string;
						name?: unknown | never;
				  }
				| {
						name: string;
						title?: unknown | never;
				  }
			);
	};
}): Parameters<
	FileRoute<TFilePath, TParentRoute, TId, TPath, TFullPath>["createRoute"]
>[0] {
	const router = orpc[routerKey];

	return {
		loader: async () => {
			return {
				data: await router.getAll.call(),
			};
		},
		component: () => {
			const {
				data: initialData,
			}: {
				data: Awaited<ReturnType<typeof router.getAll.call>>;
			} = useLoaderData({
				strict: false,
			});

			const { data } = useQuery(
				router.getAll.queryOptions({
					initialData,
				}),
			);

			return (
				<Dashboard>
					<DashboardHeader>
						<DashboardTitle>{header}</DashboardTitle>
					</DashboardHeader>
					<DashboardContent>
						<DataTable
							columns={[
								{
									accessorKey: schema.shape?.name ? "name" : "title",
									header: "Название",
								},
								{
									id: "actions",
									header: () => (
										<div className="flex justify-end">
											<AutoAdminCreateUpdate
												schema={schema}
												router={routerKey}
											/>
										</div>
									),
									cell: ({ row }) => (
										<div className="flex justify-end">
											<DropdownMenu>
												<DropdownMenuTrigger>
													<EllipsisVertical />
												</DropdownMenuTrigger>
												<DropdownMenuContent>
													<AutoAdminCreateUpdate
														value={row.original}
														schema={schema}
														router={routerKey}
													/>
													<AutoAdminDelete
														value={row.original}
														router={routerKey}
													/>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
									),
								},
							]}
							data={data}
						/>
					</DashboardContent>
				</Dashboard>
			);
		},
	};
}
