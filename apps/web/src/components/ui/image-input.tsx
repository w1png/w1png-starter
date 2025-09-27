import * as React from "react";
import {
	Edit,
	EyeIcon,
	EyeOffIcon,
	FileIcon,
	Paperclip,
	Upload,
	UploadIcon,
	XIcon,
} from "lucide-react";
import { Button } from "./button";
import Image from "./image";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "./skeleton";
import { formatBytes } from "@/utils/format";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	className?: string;
	errors?: (string | undefined)[];
}

type TFileWithMetadata = {
	url: string;
	name: string;
	sizeBytes: number;
	contentType: string;
};

function RemoteFile({ fileId }: { fileId: string }) {
	const { data: file } = useQuery({
		queryKey: ["s3-file", fileId],
		queryFn: async () => {
			const url = `${import.meta.env.VITE_SERVER_URL}/file/${fileId}`;
			const res = await fetch(url);
			const name = res.headers.get("content-disposition")?.split('"')[1];
			const sizeBytes = res.headers.get("content-length");
			return {
				url: fileId,
				name: name ?? fileId,
				sizeBytes: sizeBytes ? parseInt(sizeBytes) : 0,
				contentType: res.headers.get("content-type") ?? "",
			};
		},
	});

	return <FileWithMetadata file={file} />;
}

function FileWithMetadata({
	file,
	onDelete,
}: {
	file?: TFileWithMetadata;
	onDelete?: () => void;
}) {
	if (!file) {
		return <Skeleton className="h-14" />;
	}

	return (
		<div className="h-14 px-3 flex items-center justify-between w-full border-2 border-border/10 bg-border/5 rounded-md">
			<div className="flex gap-2 items-center">
				{file.contentType.includes("image") ? (
					<Image src={file.url} nonS3 imageClassName="size-10 rounded-md" />
				) : (
					<div className="bg-border/5 rounded-md p-1 flex items-center justify-center">
						<FileIcon className="size-6" />
					</div>
				)}
				<p className="line-clamp-1 max-w-[30ch]">{file.name}</p>
			</div>
			<div className="flex gap-2 items-center">
				<p>{formatBytes(file.sizeBytes)}</p>
				{onDelete && (
					<Button size="icon" variant="ghost" onClick={onDelete}>
						<XIcon />
					</Button>
				)}
			</div>
		</div>
	);
}

export interface ImageInputProps extends InputProps {
	images: File[] | undefined;
	setImages: (img: File[]) => void;
	s3Images?: string[] | null;
	recommendedSize?: string;
}

function FileToFileWithMetadata(file: File): TFileWithMetadata {
	return {
		url: URL.createObjectURL(file),
		name: file.name,
		sizeBytes: file.size,
		contentType: file.type,
	};
}

const FileInput = React.forwardRef<HTMLInputElement, ImageInputProps>(
	(
		{ className, recommendedSize, s3Images, images, setImages, ...props },
		ref,
	) => {
		return (
			<div className="flex flex-col gap-4 w-full">
				<label className="cursor-pointer aspect-2/1 flex items-center justify-center w-full rounded-md border-2 border-border/10 hover:border-border/20 group transition-all">
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<UploadIcon />
							<p>Загрузите нужный файл</p>
						</div>
						<p className="text-xs text-muted-foreground">{recommendedSize}</p>
					</div>
					<input
						className="hidden"
						type="file"
						multiple
						accept="image/*"
						ref={ref}
						onChange={(e) => {
							if (!e.target.files) return;
							setImages(Array.from(e.target.files));
						}}
						{...props}
					/>
				</label>
				<div className="flex flex-col gap-2 w-full">
					{images?.length !== 0
						? images?.map((img, imgIndex) => (
								<FileWithMetadata
									key={`${img.name}-${imgIndex}`}
									file={FileToFileWithMetadata(img)}
								/>
							))
						: s3Images?.length !== 0
							? s3Images?.map((img) => <RemoteFile key={img} fileId={img} />)
							: null}
				</div>
			</div>
		);
	},
);
FileInput.displayName = "FileInput";

export { FileInput };
