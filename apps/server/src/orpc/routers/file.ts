import { GetFileMetadata, s3 } from "@lunarweb/files";
import Elysia, { t } from "elysia";

export const fileRouter = new Elysia({ prefix: "/file" }).get(
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
);
