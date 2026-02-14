import { useNavigate, useSearch } from "@tanstack/react-router";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	type HeaderContext,
	useReactTable,
} from "@tanstack/react-table";
import {
	ArrowDownNarrowWideIcon,
	ArrowUpNarrowWideIcon,
	FilterX,
	SlidersHorizontalIcon,
} from "lucide-react";
import React, { type ReactNode, useEffect } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { SearchKeys } from "@/lib/types/utils";
import { Button } from "./button";
import MultpleSelect from "./multiple-select";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export function DataTable<TData, TValue>({
	columns,
	data,
}: DataTableProps<TData, TValue>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<Table>
			<TableHeader>
				{table.getHeaderGroups().map((headerGroup) => (
					<TableRow key={headerGroup.id}>
						{headerGroup.headers.map((header) => {
							return (
								<TableHead key={header.id}>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
								</TableHead>
							);
						})}
					</TableRow>
				))}
			</TableHeader>
			<TableBody>
				{table.getRowModel().rows?.length ? (
					table.getRowModel().rows.map((row) => (
						<TableRow
							data-state={row.getIsSelected() && "selected"}
							key={row.id}
						>
							{row.getVisibleCells().map((cell) => (
								<TableCell key={cell.id}>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</TableCell>
							))}
						</TableRow>
					))
				) : (
					<TableRow>
						<TableCell className="h-24 text-center" colSpan={columns.length}>
							Ничего не найдено.
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}

export function FilterableHeader<
	TData,
	TValue,
	FValue extends { id: string; name: string },
>({
	children,
	searchKey,
	values,
	...context
}: HeaderContext<TData, TValue> & {
	children: ReactNode;
	values: FValue[];
	searchKey: SearchKeys;
}) {
	const search = useSearch({
		strict: false,
	});
	const navigate = useNavigate();
	const val = search[searchKey] as string[] | null | undefined;

	useEffect(() => {
		context.column.setFilterValue(val);
	}, [context.column.setFilterValue, val]);

	return (
		<div className="flex items-center justify-between w-full">
			{children}
			<MultpleSelect
				onChange={(v) => {
					navigate({
						to: ".",
						search: {
							...search,
							[searchKey]: v.map((v) => v.id),
						},
					});
				}}
				placeholder={{
					default: "Выберите значения",
					empty: "Нет значений",
				}}
				value={values.filter((v) => val?.includes(v.id)) ?? []}
				values={values}
			>
				<Button
					className="size-fit p-1"
					variant={val?.length ? "secondary" : "outline"}
				>
					<SlidersHorizontalIcon className="size-4" />
				</Button>
			</MultpleSelect>
		</div>
	);
}

export function SortableHeader<TData, TValue>({
	children,
	searchKey,
	...context
}: HeaderContext<TData, TValue> & {
	children: React.ReactNode;
	searchKey: SearchKeys;
}) {
	const navigate = useNavigate();
	const search = useSearch({
		strict: false,
	});
	const val = search[searchKey];

	useEffect(() => {
		context.column.toggleSorting(val === "asc");
	}, [context.column.toggleSorting, val]);

	return (
		<div className="flex items-center justify-between w-full">
			{children}
			<Button
				className="size-fit p-1"
				onClick={() => {
					navigate({
						to: ".",
						search: {
							...search,
							[searchKey]: val === "asc" ? "desc" : "asc",
						},
						replace: true,
					});
				}}
				variant={val ? "secondary" : "outline"}
			>
				{val === "desc" ? (
					<ArrowDownNarrowWideIcon className="size-4" />
				) : (
					<ArrowUpNarrowWideIcon className="size-4" />
				)}
			</Button>
		</div>
	);
}

export function ResetFiltersButton() {
	const search = useSearch({
		strict: false,
	});
	const navigate = useNavigate();

	if (Object.values(search).length === 0 || Object.keys(search).length === 0)
		return null;

	return (
		<div className="flex justify-end">
			<Button
				className="size-6 p-0"
				onClick={() =>
					navigate({
						to: ".",
						search: undefined,
						replace: true,
					})
				}
				variant="destructive"
			>
				<FilterX className="size-4" />
			</Button>
		</div>
	);
}
