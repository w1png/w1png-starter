"use client";

import { Check } from "lucide-react";
import { type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

type Item = {
	id: string;
	name: string;
};

export default function MultpleSelect<T extends Item>({
	values,
	value,
	onChange,
	children,
	modal = false,
	placeholder,
	addButton,
	errors,
}: {
	values: T[];
	value: T[];
	onChange: (value: T[]) => void;
	placeholder: {
		default: string;
		empty: string;
	};
	modal?: boolean;
	includeNull?: boolean;
	includeAll?: boolean;
	multiple?: boolean;
	children: ReactNode;
	addButton?: ReactNode;
	errors?: (string | undefined)[];
}) {
	const [open, setOpen] = useState(false);
	const hasErrors = errors && errors.length > 0;

	const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

	const handleSelect = (item: T | null) => {
		const newValues = item
			? selectedValues.some((v) => v.id === item.id)
				? selectedValues.filter((v) => v.id !== item.id)
				: [...selectedValues, item]
			: [];
		onChange(newValues.length > 0 ? newValues : []);
	};

	return (
		<div className="flex flex-col">
			<Popover modal={modal} onOpenChange={setOpen} open={open}>
				<PopoverTrigger asChild>{children}</PopoverTrigger>
				<PopoverContent>
					<Command>
						<CommandInput placeholder={placeholder.default} />
						<CommandEmpty className="text-muted-foreground">
							{placeholder.empty}
						</CommandEmpty>

						<CommandList>
							<CommandGroup>
								{addButton && addButton}
								{values.map((v) => {
									const isSelected = selectedValues.some(
										(sv) => sv.id === v.id,
									);
									return (
										<CommandItem
											key={v.id}
											onSelect={() => handleSelect(v)}
											value={v.name}
										>
											<Check
												className={cn(
													"size-4 mr-1",
													isSelected ? "opacity-100" : "opacity-0",
												)}
											/>
											<span
												className={cn(
													isSelected ? "opacity-100" : "opacity-50",
												)}
											>
												{v.name}
											</span>
										</CommandItem>
									);
								})}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			<div
				className={cn(
					"flex flex-col gap-1 transition-all duration-300",
					hasErrors
						? "opacity-100 translate-y-0 blur-none mt-2"
						: "opacity-0 -translate-y-6 blur-sm",
				)}
			>
				{errors?.filter(Boolean).map((error) => (
					<p className="text-destructive text-sm" key={error}>
						{error}
					</p>
				))}
			</div>
		</div>
	);
}
