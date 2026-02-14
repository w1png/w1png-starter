import { ImageOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Loader from "../loader";

const className =
	"aspect-square flex items-center justify-center text-muted-foreground rounded-md" as const;

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
	imageClassName?: string;
}

export default function Image({ src, imageClassName, ...props }: ImageProps) {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(false);

	return (
		<>
			{error ? (
				<div className={cn(className, props.className)}>
					{error && <ImageOff className="size-[20%] animate-pulse" />}
				</div>
			) : (
				<div className={cn(className, props.className, "relative")}>
					{isLoading && (
						<div className="absolute inset-0 flex items-center justify-center bg-secondary">
							<Loader />
						</div>
					)}
					<img
						{...props}
						alt=""
						className={cn("size-full object-cover", imageClassName)}
						crossOrigin="use-credentials"
						onError={(e) => {
							console.error(e.type);
							setError(true);
							setIsLoading(false);
						}}
						onLoad={() => {
							setIsLoading(false);
						}}
						src={`${import.meta.env.VITE_SERVER_URL}/file/${src}`}
					/>
				</div>
			)}
		</>
	);
}
