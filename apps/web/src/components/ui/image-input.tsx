import { UploadIcon, FileIcon, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { Button } from "./button";

export interface FileInputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	fileIds: string[];
	setFileIds: (fileIds: string[]) => void;
	setIsLoading: (isLoading: boolean) => void;
}

interface UploadedFile {
	id: string;
	name: string;
	contentType?: string;
	size?: number;
}

interface UploadingFile {
	key: string;
	file: File;
	progress: number;
	error?: string;
}

async function fetchFileMetadata(
	id: string,
): Promise<{ name: string; contentType: string; size: number | undefined }> {
	const response = await fetch(
		`${import.meta.env.VITE_SERVER_URL}/file/${id}/data`,
		{ method: "GET" },
	);
	if (!response.ok) {
		throw new Error("Failed to fetch metadata");
	}
	const body: {
		contentType: string;
		name: string;
		size: number;
	} = await response.json();
	return {
		name: body.name,
		contentType: body.contentType,
		size: body.size,
	};
}

function formatBytes(bytes: number | undefined): string {
	if (bytes === undefined) return "";
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(0))} ${sizes[i]}`;
}

export function FileCard({
	name,
	progress,
	onDelete,
	isUploading,
	error,
	id,
	file,
	contentType,
	size,
}: {
	name: string;
	progress?: number;
	onDelete?: () => void;
	isUploading?: boolean;
	error?: string;
	id?: string;
	file?: File;
	contentType?: string;
	size?: number;
}) {
	const serverUrl = import.meta.env.VITE_SERVER_URL;

	return (
		<div className="flex items-center justify-between p-4 border rounded-md">
			<div className="flex items-center gap-2">
				{contentType?.startsWith("image/") ? (
					<img
						src={
							isUploading
								? URL.createObjectURL(file!)
								: `${serverUrl}/file/${id}`
						}
						alt={name}
						className="size-9 object-cover rounded"
					/>
				) : (
					<div className="relative">
						<FileIcon className="size-9 text-muted-foreground" />
						{name.includes(".") && (
							<div className="absolute bottom-1.5 bg-[#DB1C47] rounded p-0.5 text-primary-foreground uppercase text-[8px]">
								{name.split(".").pop()}
							</div>
						)}
					</div>
				)}

				<div className="flex flex-col">
					{!isUploading && !error && id ? (
						<a
							href={`${serverUrl}/file/${id}`}
							download={name}
							className="cursor-pointer hover:underline hover:text-primary transition"
						>
							{name}
						</a>
					) : (
						<p className="text-sm font-medium">{name}</p>
					)}

					<div className="flex gap-2 items-center text-xs text-muted-foreground">
						<p>{size !== undefined ? `${formatBytes(size)}` : ""}</p>

						{isUploading && !error && progress !== undefined ? (
							<>
								<span>•</span>
								<span className="text-primary">{progress}% Загрузка...</span>
							</>
						) : error ? (
							<>
								<span>•</span>
								<svg
									width="14"
									height="14"
									viewBox="0 0 14 14"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M9.3184 0C9.68967 7.92924e-05 10.0457 0.147631 10.3082 0.4102L13.5898 3.6918C13.8524 3.95429 13.9999 4.31033 14 4.6816V9.3184C13.9999 9.68967 13.8524 10.0457 13.5898 10.3082L10.3082 13.5898C10.0457 13.8524 9.68967 13.9999 9.3184 14H4.6816C4.31033 13.9999 3.95429 13.8524 3.6918 13.5898L0.4102 10.3082C0.147631 10.0457 7.92924e-05 9.68967 0 9.3184V4.6816C7.92924e-05 4.31033 0.147631 3.95429 0.4102 3.6918L3.6918 0.4102C3.95429 0.147631 4.31033 7.92924e-05 4.6816 0H9.3184Z"
										fill="#DB1C47"
									/>
									<path
										d="M7 9.79995H7.007M7 4.19995V6.99995"
										stroke="white"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
								<span className="text-destructive">{error}</span>
							</>
						) : null}
					</div>
				</div>
			</div>

			<div className="flex gap-1 h-full">
				{onDelete && (
					<Button
						onClick={onDelete}
						type="button"
						variant="transparent"
						size="icon"
						className="p-0 size-fit cursor-pointer hover:text-muted-foreground"
					>
						<X className="size-4" />
					</Button>
				)}
			</div>
		</div>
	);
}

function uploadFile(
	file: File,
	onProgress: (progress: number) => void,
): Promise<string> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		const url = `${import.meta.env.VITE_SERVER_URL}/file`;
		xhr.open("POST", url);
		xhr.setRequestHeader("Accept", "application/json");

		xhr.upload.onprogress = (e) => {
			if (e.lengthComputable) {
				onProgress(Math.round((e.loaded / e.total) * 100));
			}
		};

		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				const data = JSON.parse(xhr.responseText);
				resolve(data.id);
			} else {
				reject(new Error(`Ошибка ${xhr.status}`));
			}
		};

		xhr.onerror = () => reject(new Error("Ошибка"));

		const formData = new FormData();
		formData.append("file", file);
		formData.append(
			"isImage",
			file.type.startsWith("image/") ? "true" : "false",
		);
		xhr.send(formData);
	});
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
	({ className, fileIds, setFileIds, setIsLoading, ...props }, ref) => {
		const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
		const [isDragging, setIsDragging] = useState(false);
		const queryClient = useQueryClient();

		const metadataQueries = useQueries({
			queries: fileIds.map((id) => ({
				queryKey: ["fileMetadata", id],
				queryFn: () => fetchFileMetadata(id),
				staleTime: Number.POSITIVE_INFINITY,
			})),
		});

		const uploadedFiles: UploadedFile[] = fileIds.map((id, index) => {
			const query = metadataQueries[index];
			if (query.isSuccess && query.data) {
				return { id, ...query.data };
			}
			return { id, name: "Неизвестный файл" };
		});

		const uploadMutation = useMutation({
			mutationFn: ({
				file,
				onProgress,
			}: {
				file: File;
				onProgress: (p: number) => void;
				key: string;
			}) => uploadFile(file, onProgress),

			onSuccess: (id, { file, key }) => {
				setFileIds([...fileIds, id]);

				queryClient.setQueryData(["fileMetadata", id], {
					name: file.name,
					contentType: file.type,
					size: file.size,
				});

				setUploadingFiles((files) => files.filter((f) => f.key !== key));
			},

			onError: (_, { key }) => {
				setUploadingFiles((files) =>
					files.map((f) => (f.key === key ? { ...f, error: "Ошибка" } : f)),
				);
			},
		});

		useEffect(() => {
			setIsLoading(uploadingFiles.some((u) => u.error === undefined));
		}, [uploadingFiles, setIsLoading]);

		const handleFiles = (files: File[]) => {
			const newUploading = files.map((file) => ({
				key: `${file.name}-${Date.now()}`,
				file,
				progress: 0,
				error: undefined,
			}));

			setUploadingFiles([...uploadingFiles, ...newUploading]);

			newUploading.forEach((u) => {
				const onProgress = (p: number) =>
					setUploadingFiles((current) =>
						current.map((f) => (f.key === u.key ? { ...f, progress: p } : f)),
					);

				uploadMutation.mutate({
					file: u.file,
					onProgress,
					key: u.key,
				});
			});
		};

		const handleDeleteUploaded = (id: string) => {
			queryClient.removeQueries({ queryKey: ["fileMetadata", id] });
			setFileIds(fileIds.filter((fid) => fid !== id));
		};

		const handleDeleteUploading = (key: string) => {
			setUploadingFiles(uploadingFiles.filter((f) => f.key !== key));
		};

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(e.target.files || []);
			if (files.length > 0) {
				handleFiles(files);
			}
			e.target.value = "";
		};

		const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
			e.preventDefault();
			setIsDragging(false);
			const files = Array.from(e.dataTransfer.files);
			if (files.length > 0) {
				handleFiles(files);
			}
		};

		return (
			<div className="flex flex-col gap-4 w-full">
				<label
					className={`cursor-pointer w-full py-6 flex items-center justify-center rounded-xl border border-dashed bg-secondary group transition-all ${
						isDragging ? "border-primary bg-secondary/80" : ""
					}`}
					onDragEnter={(e) => {
						e.preventDefault();
						setIsDragging(true);
					}}
					onDragOver={(e) => {
						e.preventDefault();
						setIsDragging(true);
					}}
					onDragLeave={(e) => {
						e.preventDefault();
						setIsDragging(false);
					}}
					onDrop={handleDrop}
				>
					<div className="flex flex-col justify-center items-center gap-1">
						<UploadIcon />
						<div className="flex flex-col text-center">
							<p className="font-medium text-sm">Добавить файлы</p>
							<p className="text-xs text-muted-foreground">
								Перетащите его сюда
							</p>
						</div>
					</div>

					<input
						className="hidden"
						type="file"
						ref={ref}
						onChange={handleChange}
						{...props}
					/>
				</label>

				<div className="flex flex-col gap-2 w-full">
					{uploadedFiles.map((f) => (
						<FileCard
							key={f.id}
							name={f.name}
							onDelete={() => handleDeleteUploaded(f.id)}
							id={f.id}
							contentType={f.contentType}
							size={f.size}
						/>
					))}

					{uploadingFiles.map((u) => (
						<FileCard
							key={u.key}
							name={u.file.name}
							progress={u.progress}
							isUploading={true}
							error={u.error}
							file={u.file}
							contentType={u.file.type}
							size={u.file.size}
							onDelete={
								u.error ? () => handleDeleteUploading(u.key) : undefined
							}
						/>
					))}
				</div>
			</div>
		);
	},
);

FileInput.displayName = "FileInput";

export { FileInput };
