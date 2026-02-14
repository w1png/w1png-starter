import * as React from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

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
						variant === "textarea" ? "h-fit min-h-[120px]" : "",
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
							type={type}
							className={inputClassName}
							placeholder={placeholder}
							ref={ref as React.Ref<HTMLInputElement>}
							{...props}
						/>
					) : (
						// @ts-ignore
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
					type={visible ? "text" : "password"}
					className="pr-12"
					ref={ref}
					{...props}
				/>
				<Button
					tabIndex={-1}
					size="icon"
					type="button"
					variant="transparent"
					onClick={() => setVisible(!visible)}
					className="absolute h-12 right-0 inset-y-0 text-muted-foreground"
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
