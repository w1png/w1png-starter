
import { format, isSameDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Calendar as CalendarIcon } from "lucide-react";
import { forwardRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

export const DatePicker = forwardRef<
	HTMLDivElement,
	{
		value?: Date | null;
		onChange: (val?: Date | null) => void;
		children?: React.ReactNode;
		side?: "top" | "bottom";
		sideOffset?: number;
		allowedDates?: Date[];
		placeholder?: string;
	}
>(function DatePickerCmp(
	{
		children,
		sideOffset,
		placeholder,
		allowedDates,
		side,
		value: date,
		onChange: setDate,
	},
	ref,
) {
	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen} modal={true}>
			<PopoverTrigger asChild>
				{children ? (
					children
				) : (
					<Button
						variant={"outline"}
						className={cn(
							"w-full justify-start text-left font-normal",
							!date && "text-muted-foreground",
						)}
						onClick={() => setOpen(true)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{date ? (
							format(toZonedTime(date, "Europe/Moscow"), "dd.MM.yyyy", {
								locale: ru,
							})
						) : (
							<span>{placeholder}</span>
						)}
					</Button>
				)}
			</PopoverTrigger>
			<PopoverContent
				sideOffset={sideOffset}
				side={side}
				className="w-auto p-0"
				ref={ref}
			>
				<Calendar
					locale={ru}
					mode="single"
					fixedWeeks
					selected={date ?? undefined}
					onSelect={(d) => {
						if (d) {
							const moscowDate = toZonedTime(d, "Europe/Moscow");
							setDate(moscowDate);
						} else {
							setDate(null);
						}
						setOpen(false);
					}}
					initialFocus
					disabled={(d) => {
						if (!allowedDates) return false;
						return !allowedDates.some((ad) =>
							isSameDay(
								toZonedTime(ad, "Europe/Moscow"),
								toZonedTime(d, "Europe/Moscow"),
							),
						);
					}}
				/>
			</PopoverContent>
		</Popover>
	);
});
