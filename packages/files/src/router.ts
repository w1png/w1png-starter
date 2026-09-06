import { Elysia } from "elysia";
import { z } from "zod";
import { MAX_FILE_SIZE, type FileService } from "./service";

export class FileRouter {
	readonly http;
	constructor({ fileService }: { fileService: FileService }) {
		this.http = new Elysia({ prefix: "/file" })
			.get("/:id", async ({ params, status }) => {
				const meta = await fileService.metadata(params.id);
				if (!meta) return status(404, "File not found");
				return new Response(fileService.stream(meta.id), {
					headers: {
						"Content-Type": meta.contentType,
						"Content-Disposition": `attachment; filename="${encodeURIComponent(meta.name)}"`,
					},
				});
			})
			.get("/:id/data", async ({ params, status }) => {
				const meta = await fileService.metadata(params.id);
				if (!meta) return status(404, "File not found");
				return {
					contentType: meta.contentType,
					name: meta.name,
					size: meta.size,
				};
			})
			.post(
				"/",
				async ({ body }) => ({ id: await fileService.upload(body.file) }),
				{
					body: z.compile(z.object({ file: z.file().max(MAX_FILE_SIZE) })),
				},
			);
	}
}
