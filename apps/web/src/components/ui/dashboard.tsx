import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DashboardProps extends React.HTMLAttributes<HTMLDivElement> {
	children?: ReactNode;
}

export function Dashboard({ className, children, ...props }: DashboardProps) {
	return (
		<div
			className={cn(
				"h-full bg-white rounded-xl overflow-hidden md:rounded-2xl flex flex-col grow shrink p-4",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

export interface DashboardHeaderProps
	extends React.HTMLAttributes<HTMLDivElement> {
	children?: ReactNode;
}

export function DashboardHeader({
	className,
	children,
	...props
}: DashboardHeaderProps) {
	return (
		<div className="flex gap-2 items-center w-full">
			<div
				className={cn(
					"flex gap-4 items-center justify-between w-full",
					className,
				)}
				{...props}
			>
				{children}
			</div>
		</div>
	);
}

export interface DashboardTitleProps
	extends React.HTMLAttributes<HTMLDivElement> {
	children?: ReactNode;
}

export function DashboardTitle({
	className,
	children,
	...props
}: DashboardTitleProps) {
	return (
		<div
			className={cn(
				"flex flex-col font-medium text-2xl border-b-2 pb-4 border-dashed w-full",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

export interface DashboardTitleTextProps
	extends React.HTMLAttributes<HTMLHeadElement> {
	children?: ReactNode;
}

export function DashboardTitleText({
	className,
	children,
	...props
}: DashboardTitleTextProps) {
	return (
		<h1 className={cn("font-medium text-xl", className)} {...props}>
			{children}
		</h1>
	);
}

export interface DashboardSubtitleProps
	extends React.HTMLAttributes<HTMLHeadElement> {
	children?: ReactNode;
}

export function DashboardSubtitle({
	className,
	children,
	...props
}: DashboardSubtitleProps) {
	return (
		<h2 className={cn("text-sm text-muted-foreground", className)} {...props}>
			{children}
		</h2>
	);
}

export interface DashboardContentProps
	extends React.HTMLAttributes<HTMLDivElement> {
	children?: ReactNode;
}

export function DashboardContent({
	className,
	children,
	...props
}: DashboardContentProps) {
	return (
		<div
			className={cn(
				"overflow-y-scroll overflow-x-scroll space-y-4 grow py-6 w-full",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}
