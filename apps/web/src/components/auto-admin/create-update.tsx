/** biome-ignore-all lint/correctness/useHookAtTopLevel: dont care */
import type { ZodObject, ZodType } from "zod/v4";
import {
	getRealZodType,
	type AdminRouterKeys,
	type CreateInput,
	type FieldConfigs,
	type GetOutput,
} from "./types";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc, queryClient } from "@/lib/orpc";
import { toast } from "sonner";
import { useForm, type FormValidateOrFn } from "@tanstack/react-form";
import type { DeepValue } from "@tanstack/react-table";
import { FileInput } from "../ui/image-input";
import { Input } from "../ui/input";
import { ChevronDown, PlusIcon, SquarePenIcon, TrashIcon } from "lucide-react";
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
import MultipleSelect from "../ui/multiple-select";
import { cn } from "@/lib/utils";
import Combobox from "../ui/combobox";
import { Switch } from "../ui/switch";

export function AutoAdminCreateUpdate<
	R extends AdminRouterKeys,
	S extends ZodObject,
	CFG extends FieldConfigs<S>,
>({
	schema,
	router: routerKey,
	value,
	config,
}: {
	schema: S & { _output: CreateInput<R> };
	router: R;
	value?: GetOutput<R>;
	config?: CFG;
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
		const cfg = config?.fields?.[k];

		const [newArrayValue, setNewArrayValue] = useState<string>("");

		const isArray = zodField.type === "array";
		const isFile = cfg?.type === "file";
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
					accept={cfg?.fileType}
				/>
			);
		}

		const { data: selectValues } = useQuery({
			queryKey: ["selectFrom", cfg?.label, cfg?.placeholder],
			queryFn: async () => {
				return cfg?.selectFrom?.() ?? null;
			},
		});

		if (isArray) {
			const fieldValue = (field.state.value ?? []) as string[];

			if (selectValues) {
				const active = selectValues.filter((v) => fieldValue.includes(v.id));

				return (
					<MultipleSelect
						values={selectValues}
						placeholder={{
							default: cfg?.placeholder ?? "Выберите значения",
							empty: "Ничего не найдено",
						}}
						value={active}
						onChange={(v) =>
							field.handleChange(v.map((v) => v.id) as CastedValue)
						}
					>
						<Button variant="input" className="justify-between">
							<span className="max-w-[35ch] line-clamp-1 truncate">
								Выбрано: {active.length}
							</span>
							<ChevronDown />
						</Button>
					</MultipleSelect>
				);
			}

			return (
				<div className="space-y-2">
					<div className="flex gap-2 items-center w-full">
						<Input
							className="grow"
							value={newArrayValue}
							placeholder={cfg?.placeholder}
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
										placeholder={cfg?.placeholder}
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

		if (selectValues) {
			const active = selectValues.find((v) => field.state.value === v.id);

			return (
				<Combobox
					values={selectValues}
					value={active}
					onChange={(value) =>
						field.handleChange((value?.id ?? "") as CastedValue)
					}
					placeholder={cfg?.placeholder ?? "Выберите значение"}
				>
					<Button variant="input" className="justify-between w-full">
						<span>
							{active?.title ??
								active?.name ??
								cfg?.placeholder ??
								"Выберите значение"}
						</span>
						<ChevronDown />
					</Button>
				</Combobox>
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
						placeholder={cfg?.placeholder}
						errors={field.state.meta.errors.map(
							(e) => (e as { message: string } | undefined)?.message,
						)}
					/>
				);
			}
			case "boolean": {
				return (
					<>
						<div className="flex items-center gap-2">
							{cfg?.type === "switch" ? (
								<Switch
									onCheckedChange={(v) =>
										field.handleChange(v.valueOf() as CastedValue)
									}
									checked={field.state.value as boolean}
								/>
							) : (
								<Checkbox
									onCheckedChange={(v) =>
										field.handleChange(v.valueOf() as CastedValue)
									}
									checked={field.state.value as boolean}
								/>
							)}

							<span>{cfg?.placeholder}</span>
						</div>
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
							placeholder={cfg?.placeholder}
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
											<Label>{config?.fields?.[key]?.label ?? key}</Label>
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
