import { GetFileMetadata, s3, UploadFile } from "@lunarweb/files";
import { Elysia } from "elysia";
import z from "zod/v4";

export const fileRouter = new Elysia({ prefix: "/file" })
	.get("/:id", async ({ params, set }) => {
		const meta = await GetFileMetadata(params.id);

		set.headers["Content-Type"] = meta.contentType;
		set.headers["Content-Disposition"] =
			`attachment; filename="${encodeURIComponent(meta.name)}"`;

		const s3File = s3.file(meta.id);

		return new Response(s3File.stream(), {
			headers: {
				"Content-Type": meta.contentType,
				"Content-Disposition": `attachment; filename="${encodeURIComponent(meta.name)}"`,
			},
		});
	})
	.get("/:id/data", async ({ params }) => {
		const meta = await GetFileMetadata(params.id);
		const s3File = s3.file(meta.id);

		return {
			contentType: meta.contentType,
			name: meta.name,
			size: (await s3File.stat()).size,
		};
	})

	.post(
		"/",
		async ({ body }) => {
			return {
				id: await UploadFile({
					file: body.file,
				}),
			};
		},
		{
			body: z.object({
				file: z.file(),
			}),
		},
	);
