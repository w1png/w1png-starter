import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Loader({ className }: { className?: string }) {
	return (
		<div className={cn("flex h-full items-center justify-center", className)}>
			<Loader2 className="animate-spin" />
		</div>
	);
}
