import { cn } from "@/lib/utils";

export default function Errors({
	errors,
}: {
	errors?: (string | undefined)[];
}) {
	const hasErrors = errors && errors.length > 0;

	return (
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
	);
}
