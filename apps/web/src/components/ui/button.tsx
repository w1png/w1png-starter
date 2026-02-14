import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import Loader from "@/components/loader";

const buttonVariants = cva(
	"inline-flex items-center leading-[130%] justify-center gap-2 whitespace-nowrap rounded-md text-base ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"text-primary-foreground bg-primary px-6 py-4 hover:bg-primary/80",
				destructive:
					"bg-destructive text-destructive-foreground hover:bg-destructive/90",
				outline: "border border-border/20 bg-background hover:bg-border/5",
				"outline-destructive":
					"border text-destructive border-destructive bg-background hover:bg-destructive hover:text-destructive-foreground",
				secondary:
					"bg-white text-secondary-foreground hover:bg-primary hover:text-primary-foreground",
				muted: "bg-muted/40 text-foreground hover:bg-muted/80",
				transparent: "bg-transparent border-0 hover:bg-transparent",
				ghost: "hover:bg-foreground/10",
				cancel: "bg-secondary text-slate-900 hover:bg-border border",
				link: "text-primary underline-offset-4 hover:text-primary",
				white: "bg-white text-foregroud border border-input hover:bg-white/90",
				input:
					"bg-input/5 border-2 border-input/10 disabled:opacity-30 hover:opacity-80",
			},
			size: {
				default: "h-11 p-3",
				sm: "px-2.5 py-2 rounded-[6px]",
				lg: "h-11 rounded-md px-8",
				icon: "h-10 w-10",
				link: "size-fit p-0 m-0",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant,
			disabled,
			children,
			loading,
			size,
			asChild = false,
			...props
		},
		ref,
	) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				disabled={loading || disabled}
				{...props}
			>
				{loading ? <Loader /> : children}
			</Comp>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
