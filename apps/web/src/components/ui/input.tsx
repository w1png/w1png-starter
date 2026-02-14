import { EyeIcon, EyeOffIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	className?: string;
	errors?: (string | undefined)[];
	variant?: "default" | "textarea";
}

const Input = React.forwardRef<
	HTMLInputElement | HTMLTextAreaElement,
	InputProps
>(
	(
		{ className, errors, variant = "default", placeholder, type, ...props },
		ref,
	) => {
		const hasErrors = errors && errors.length > 0;

		const inputClassName = cn(
			"flex transition-all duration-300 w-full text-base resize-none px-3 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:outline-hidden focus-visible:ring-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
			placeholder && props.value ? "h-10 mt-4" : "h-14",
			variant === "textarea" ? "h-[calc(100%-44px)] py-2 min-h-[120px]" : "",
		);

		return (
			<div className={cn("flex flex-col", className)}>
				<div
					className={cn(
						"relative rounded-md border-2 bg-input/5 h-14 transition-all duration-300",
						hasErrors
							? "border-destructive/80 hover:border-destructive"
							: "border-input/10 hover:border-input/30",
						variant === "textarea" ? "h-fit min-h-30" : "",
					)}
				>
					<div
						className={cn(
							"pointer-events-none absolute transition-all duration-300 text-xs text-muted-foreground top-1 left-3",
							placeholder && props.value ? "" : "opacity-0 blur-sm scale-80",
						)}
					>
						{placeholder}
					</div>

					{variant === "default" ? (
						<input
							className={inputClassName}
							placeholder={placeholder}
							ref={ref as React.Ref<HTMLInputElement>}
							type={type}
							{...props}
						/>
					) : (
						// @ts-expect-error
						<textarea
							className={cn(inputClassName)}
							placeholder={placeholder}
							ref={ref as React.Ref<HTMLTextAreaElement>}
							{...props}
						/>
					)}
				</div>
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
	},
);
Input.displayName = "Input";

const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, ...props }, ref) => {
		const [visible, setVisible] = React.useState(false);

		return (
			<div className="h-fit relative flex">
				<Input
					autoComplete="current-password"
					className="pr-12"
					ref={ref}
					type={visible ? "text" : "password"}
					{...props}
				/>
				<Button
					className="absolute h-12 right-0 inset-y-0 text-muted-foreground"
					onClick={() => setVisible(!visible)}
					size="icon"
					tabIndex={-1}
					type="button"
					variant="transparent"
				>
					{visible ? (
						<EyeOffIcon className="size-8" />
					) : (
						<EyeIcon className="size-8" />
					)}
				</Button>
			</div>
		);
	},
);
PasswordInput.displayName = "PasswordInput";

export { Input, PasswordInput };
