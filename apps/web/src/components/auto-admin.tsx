/** biome-ignore-all lint/correctness/useHookAtTopLevel: temp */
import { orpc, queryClient } from "@/lib/orpc";
import {
	useForm,
	type DeepValue,
	type FormValidateOrFn,
} from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	type AnyRoute,
	type FileRoute,
	type FileRoutesByPath,
	type RouteConstraints,
	useLoaderData,
} from "@tanstack/react-router";
import { toast } from "sonner";
import {
	ZodArray,
	ZodNullable,
	ZodOptional,
	type ZodObject,
	type ZodType,
} from "zod/v4";
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
import {
	EllipsisVertical,
	PlusIcon,
	SquarePenIcon,
	Trash,
	TrashIcon,
} from "lucide-react";
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
import Errors from "./ui/errors";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "./ui/alert-dialog";

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

function Delete({
	value,
	router: routerKey,
}: {
	value: Awaited<
		ReturnType<(typeof orpc)[AdminRouterKeys]["getAll"]["call"]>
	>[number];
	router: AdminRouterKeys;
}) {
	const [open, setOpen] = useState(false);

	const router = orpc[routerKey];
	const deleteMutation = useMutation(
		router.delete.mutationOptions({
			onSuccess: async () => {
				toast.success("Удалено");
				await queryClient.invalidateQueries({
					queryKey: router.getAll.key(),
				});
				setOpen(false);
			},
		}),
	);

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
					<Trash />
					<span>Удалить</span>
				</DropdownMenuItem>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Удалить занятие?</AlertDialogTitle>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Отмена</AlertDialogCancel>
					<AlertDialogAction asChild>
						<Button
							loading={deleteMutation.isPending}
							onClick={() => {
								deleteMutation.mutate({ id: value.id });
							}}
						>
							Удалить
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function getRealZodType(zodType: ZodType) {
	if (zodType instanceof ZodNullable || zodType instanceof ZodOptional) {
		return getRealZodType(zodType.unwrap() as ZodType);
	}

	if (zodType instanceof ZodArray) {
		return getRealZodType(zodType.element as ZodType);
	}

	return zodType;
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

	const router = orpc[routerKey];

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
		defaultValues: value as CreateInput<R>,
		onSubmit: ({ value: data }) => {
			if (value) {
				updateMutation.mutate({
					...data,
					id: value.id,
				});
			} else {
				createMutation.mutate(data);
			}
		},
		validators: {
			onSubmit: schema as FormValidateOrFn<CreateInput<R>>,
		},
	});

	function AutoAdminInput({
		k,
		zodField,
		field,
	}: {
		k: string;
		zodField: ZodType;
		field: Parameters<Parameters<typeof form.Field>[0]["children"]>[0];
	}) {
		const [newArrayValue, setNewArrayValue] = useState<string>("");

		const isArray = zodField.type === "array";
		const isFile = zodField.description?.includes("FILE");
		const realType = getRealZodType(zodField).type;

		/** biome-ignore lint/suspicious/noExplicitAny: intended */
		type CastedValue = DeepValue<CreateInput<R>, any>;

		if (isFile) {
			const val =
				isArray || !field.state.value
					? ((field.state.value ?? []) as string[])
					: [field.state.value as string];

			const onChange = (i: string[]) => {
				if (isArray) {
					field.handleChange(i as CastedValue);
					return;
				}

				field.handleChange(i.at(-1) as CastedValue);
			};

			return (
				<FileInput
					fileIds={val}
					setIsLoading={() => {}}
					setFileIds={onChange}
					multiple={isArray}
				/>
			);
		}

		if (isArray) {
			const fieldValue = (field.state.value ?? []) as string[];

			return (
				<div className="space-y-2">
					<div className="flex gap-2 items-center w-full">
						<Input
							className="grow"
							value={newArrayValue}
							onChange={(e) => setNewArrayValue(e.target.value)}
						/>
						<Button
							disabled={!newArrayValue}
							onClick={() => {
								if (!newArrayValue) return;
								field.pushValue(newArrayValue as never);
								setNewArrayValue("");
							}}
							type="button"
							size="icon"
							className="aspect-square h-auto"
						>
							<PlusIcon />
						</Button>
					</div>
					{fieldValue.map((_, i) => (
						<form.Field name={`${k}[${i}]`} key={`${k}[${i.toString()}]`}>
							{(childField) => (
								<div className="flex gap-2 items-center w-full">
									<Input
										className="grow"
										value={childField.state.value as string}
										onChange={(e) =>
											childField.handleChange(e.target.value as CastedValue)
										}
										errors={childField.state.meta.errors.map(
											(e) => (e as { message: string } | undefined)?.message,
										)}
									/>
									<Button
										onClick={() => {
											field.removeValue(i);
										}}
										type="button"
										variant="destructive"
										size="icon"
										className="aspect-square h-auto"
									>
										<TrashIcon />
									</Button>
								</div>
							)}
						</form.Field>
					))}
				</div>
			);
		}

		switch (realType) {
			case "number":
			case "string": {
				return (
					<Input
						value={field.state.value as string}
						onChange={(e) => field.handleChange(e.target.value as CastedValue)}
						onBlur={field.handleBlur}
						errors={field.state.meta.errors.map(
							(e) => (e as { message: string } | undefined)?.message,
						)}
					/>
				);
			}
			case "boolean": {
				return (
					<>
						<Checkbox
							onCheckedChange={(v) =>
								field.handleChange(v.valueOf() as CastedValue)
							}
							checked={field.state.value as boolean}
						/>
						<Errors
							errors={field.state.meta.errors.map(
								(e) => (e as { message: string } | undefined)?.message,
							)}
						/>
					</>
				);
			}
			case "date": {
				return (
					<>
						<DatePicker
							value={
								field.state.value
									? new Date(field.state.value as string)
									: undefined
							}
							onChange={(v) => field.handleChange(v as CastedValue)}
						/>
						<Errors
							errors={field.state.meta.errors.map(
								(e) => (e as { message: string } | undefined)?.message,
							)}
						/>
					</>
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
						name?: never;
				  }
				| {
						name: string;
						title?: never;
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
