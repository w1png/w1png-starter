import { Check } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "@/lib/utils";

type Item = {
	id: string;
	name: string;
};

export default function Combobox<T extends Item>({
	values,
	value,
	onChange,
	children,
	includeAll = false,
	allText = "Все",
	placeholder,
	errors,
	addButton,
	modal,
}: {
	values: T[];
	value: Item | null | undefined;
	onChange: (value: T | null) => void;
	allText?: string;
	placeholder: string;
	addButton?: ReactNode;
	includeAll?: boolean;
	children: ReactNode;
	errors?: (string | undefined)[];
	modal?: boolean;
}) {
	const hasErrors = errors && errors.length > 0;
	const [open, setOpen] = useState(false);

	return (
		<div className="flex flex-col">
			<Popover modal={modal} onOpenChange={setOpen} open={open}>
				<PopoverTrigger asChild>{children}</PopoverTrigger>
				<PopoverContent>
					<Command className="text-nowrap">
						<CommandInput placeholder={placeholder} />
						<CommandEmpty className="text-muted-foreground">
							Ничего не найдено
						</CommandEmpty>

						<CommandList>
							<CommandGroup>
								{addButton && addButton}
								{includeAll && (
									<CommandItem
										onSelect={() => {
											onChange(null);
											setOpen(false);
										}}
										value={undefined}
									>
										{allText}
										<Check
											className={cn(
												"size-4 mr-2",
												!value ? "opacity-50" : "opacity-0",
											)}
										/>
									</CommandItem>
								)}
								{values.map((v) => (
									<CommandItem
										key={v.id}
										onSelect={() => {
											onChange(v);
											setOpen(false);
										}}
										value={v.name}
									>
										{v.name}
										<Check
											className={cn(
												"size-4 mr-2",
												v.id === value?.id ? "opacity-50" : "opacity-0",
											)}
										/>
									</CommandItem>
								))}
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
