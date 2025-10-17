import { GetFileMetadata, s3, UploadFile } from "@lunarweb/files";
import Elysia, { t } from "elysia";

export const fileRouter = new Elysia({ prefix: "/file" })
	.get(
		"/:id",
		async ({ params, set }) => {
			const meta = await GetFileMetadata(params.id);

			set.headers["Content-Type"] = meta.contentType;
			set.headers["Content-Disposition"] =
				`attachment; filename="${encodeURIComponent(meta.fileName)}"`;

			const s3File = s3.file(meta.id);

			return new Response(s3File.stream(), {
				headers: {
					"Content-Type": meta.contentType,
					"Content-Disposition": `attachment; filename="${encodeURIComponent(meta.fileName)}"`,
				},
			});
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		},
	)
	.get(
		"/:id/data",
		async ({ params, set }) => {
			const meta = await GetFileMetadata(params.id);
			const s3File = s3.file(meta.id);

			return {
				contentType: meta.contentType,
				fileName: meta.fileName,
				size: (await s3File.stat()).size,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		},
	)

	.post(
		"/",
		async ({ body }) => {
			return {
				id: await UploadFile({
					file: body.file,
					isImage: body.isImage === "true",
				}),
			};
		},
		{
			body: t.Object({
				file: t.File(),
				isImage: t.String(),
			}),
		},
	);
