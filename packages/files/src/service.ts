import { z } from "zod";
import type { Database } from "@lunarweb/database";
import { eq } from "drizzle-orm";
import mime from "mime-types";

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const FileMetadataSchema = z.object({
	id: z.string(),
	name: z.string(),
	size: z.number().int().nonnegative(),
	contentType: z.string(),
});
export type FileMetadata = z.infer<typeof FileMetadataSchema>;
export interface ObjectStorage {
	file(id: string): {
		write(data: Uint8Array, options: { type: string }): Promise<unknown>;
		stream(): ReadableStream<Uint8Array>;
		stat(): Promise<{ size: number }>;
	};
}

export class FileService {
	constructor(
		private readonly dependencies: {
			context: { db: Database };
			storage: ObjectStorage;
		},
	) {}
	async upload(file: File) {
		if (file.size > MAX_FILE_SIZE) throw new Error("File exceeds 5 MiB limit");
		const contentType = mime.lookup(file.name) || "application/octet-stream";
		const table = this.dependencies.context.db.tables.files;
		const [metadata] = await this.dependencies.context.db.connection
			.insert(table)
			.values({
				name: file.name,
				size: file.size,
				contentType,
			})
			.returning();
		if (!metadata) throw new Error("File metadata creation failed");
		try {
			await this.dependencies.storage
				.file(metadata.id)
				.write(new Uint8Array(await file.arrayBuffer()), { type: contentType });
		} catch (error) {
			await this.dependencies.context.db.connection
				.delete(table)
				.where(eq(table.id, metadata.id));
			throw error;
		}
		return metadata.id;
	}
	metadata(id: string) {
		return this.dependencies.context.db.connection.query.files.findFirst({
			where: eq(this.dependencies.context.db.tables.files.id, id),
		});
	}
	stream(id: string) {
		return this.dependencies.storage.file(id).stream();
	}
}
