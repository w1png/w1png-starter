/** biome-ignore-all lint/correctness/useHookAtTopLevel: temp */
import { orpc, queryClient } from "@/lib/orpc";
import { FieldApi, useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	type createFileRoute,
	getRouteApi,
	useLoaderData,
	type FileRoute,
	type FileRoutesByPath,
} from "@tanstack/react-router";
import { toast } from "sonner";
import { z, type ZodObject, type ZodType, type ZodTypeAny } from "zod/v4";
import {
	Dashboard,
	DashboardContent,
	DashboardHeader,
	DashboardTitle,
} from "./ui/dashboard";
import { DataTable } from "./ui/data-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { EllipsisVertical, PlusIcon, SquarePenIcon } from "lucide-react";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogInnerContent,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

import { FileInput } from "./ui/image-input";
import { Checkbox } from "./ui/checkbox";
import { DatePicker } from "./ui/date-picker";

type HasAdminMethods<T> = T extends {
	getAll: unknown;
	create: unknown;
	update: unknown;
	delete: unknown;
}
	? true
	: false;

type AppRouter = typeof orpc;

type AdminRouterKeys = {
	[K in keyof AppRouter]: HasAdminMethods<AppRouter[K]> extends true
		? K
		: never;
}[keyof AppRouter];

type CreateInput<T extends AdminRouterKeys> = Parameters<
	AppRouter[T]["create"]["call"]
>["0"];

function Delete() {
	return "delete";
}

function getRealZodType(zodType: ZodTypeAny) {
	const type = zodType.type;
	switch (type) {
		case "optional":
		case "nullable":
			return getRealZodType(zodType.unwrap?.());
		case "array":
			return getRealZodType(zodType.element);
		default:
			return zodType;
	}
}

function CreateUpdate<R extends AdminRouterKeys, S extends ZodObject>({
	schema,
	router: routerKey,
	value,
}: {
	schema: S & { _output: CreateInput<R> };
	router: R;
	value?: Awaited<ReturnType<(typeof orpc)[R]["getAll"]["call"]>>[number];
}) {
	const [open, setOpen] = useState(false);

	const router = orpc.tests;

	const createMutation = useMutation(
		router.create.mutationOptions({
			onSuccess: async () => {
				toast.success("Создано");
				await queryClient.invalidateQueries({
					queryKey: router.getAll.key(),
				});
			},
		}),
	);

	const updateMutation = useMutation(
		router.update.mutationOptions({
			onSuccess: async () => {
				toast.success("Обновлено");
				await queryClient.invalidateQueries({
					queryKey: router.getAll.key(),
				});
			},
		}),
	);

	const form = useForm({
		validators: {
			onSubmit: schema,
		},
	});

	function AutoAdminInput({
		k,
		zodField,
		field,
	}: {
		k: string;
		zodField: ZodType;
		field: typeof form.Field;
	}) {
		const isArray = zodField.type === "array";
		const isFile = zodField.description?.includes("FILE");
		const realType = getRealZodType(zodField).type;

		if (isFile) {
			return (
				<FileInput
					fileIds={(field.state.value ?? []) as string[]}
					setIsLoading={() => {}}
					setFileIds={(i) => field.handleChange(i)}
					multiple={isArray}
				/>
			);
		}

		switch (realType) {
			case "number":
			case "string": {
				return (
					<Input
						value={field.state.value as string}
						onChange={(e) => field.handleChange(e.target.value)}
						onBlur={field.handleBlur}
						errors={field.state.meta.errors.map((e) => e?.message)}
					/>
				);
			}
			case "boolean": {
				return (
					<Checkbox
						onCheckedChange={(v) => field.handleChange(v.valueOf() as boolean)}
						checked={field.state.value as boolean}
					/>
				);
			}
			case "date": {
				return (
					<DatePicker
						value={field.state.value as Date}
						onChange={(v) => field.handleChange(v)}
					/>
				);
			}

			default:
				`Unsupported type ${zodField.type} for field ${k}`;
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{value ? (
					<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
						<SquarePenIcon />
						<span>Редактировать</span>
					</DropdownMenuItem>
				) : (
					<Button size="icon" className="aspect-square p-0 size-6">
						<PlusIcon className="size-4" />
					</Button>
				)}
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{value ? "Редактировать" : "Создать"}</DialogTitle>
				</DialogHeader>

				<form
					className="flex flex-col gap-4"
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<DialogInnerContent className="flex flex-col gap-4 m-0">
						{Object.keys(schema.shape).map((key) => {
							const zodField: ZodType = schema.shape[key];

							return (
								<form.Field name={key} key={key}>
									{(field) => (
										<div className="space-y-2">
											<Label>
												{zodField.description?.replace("FILE;", "") ?? key}
											</Label>
											<AutoAdminInput
												field={field}
												k={key}
												key={key}
												zodField={zodField}
											/>
										</div>
									)}
								</form.Field>
							);
						})}
					</DialogInnerContent>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline">
								Закрыть
							</Button>
						</DialogClose>
						<form.Subscribe>
							{(state) => (
								<Button
									loading={
										createMutation.isPending ||
										updateMutation.isPending ||
										state.isSubmitting
									}
									disabled={!state.canSubmit}
								>
									Сохранить
								</Button>
							)}
						</form.Subscribe>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

type A = Parameters<ReturnType<typeof createFileRoute>>["0"];

export default function AutoAdmin<
	R extends AdminRouterKeys,
	S extends ZodObject,
>({
	schema,
	path,
	router: routerKey,
	header,
}: {
	header: string;
	router: R;
	path: keyof FileRoutesByPath;
	schema: S & {
		_output: CreateInput<R> &
			(
				| {
						title: string;
						name?: never;
				  }
				| {
						name: string;
						title?: never;
				  }
			);
	};
}): Parameters<ReturnType<typeof createFileRoute>>[0] {
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
											<CreateUpdate schema={schema} router={routerKey} />
										</div>
									),
									cell: ({ row }) => (
										<div className="flex justify-end">
											<DropdownMenu>
												<DropdownMenuTrigger>
													<EllipsisVertical />
												</DropdownMenuTrigger>
												<DropdownMenuContent>
													<CreateUpdate
														value={row.original}
														schema={schema}
														router={routerKey}
													/>
													<Delete value={row.original} router={routerKey} />
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
