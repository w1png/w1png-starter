import type { ZodObject, ZodType } from "zod/v4";
import {
	getRealZodType,
	type AdminRouterKeys,
	type AppRouter,
	type CreateInput,
	type GetOutput,
} from "./types";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { orpc, queryClient } from "@/lib/orpc";
import { toast } from "sonner";
import { useForm, type FormValidateOrFn } from "@tanstack/react-form";
import type { DeepValue } from "@tanstack/react-table";
import { FileInput } from "../ui/image-input";
import { Input } from "../ui/input";
import { PlusIcon, SquarePenIcon, TrashIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import Errors from "../ui/errors";
import { DatePicker } from "../ui/date-picker";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogInnerContent,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { Label } from "../ui/label";

export function AutoAdminCreateUpdate<
	R extends AdminRouterKeys,
	S extends ZodObject,
>({
	schema,
	router: routerKey,
	value,
}: {
	schema: S & { _output: CreateInput<R> };
	router: R;
	value?: GetOutput<R>;
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
