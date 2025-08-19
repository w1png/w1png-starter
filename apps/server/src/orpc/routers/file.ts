import { GetFile } from "@lunarweb/files";
import Elysia, { t } from "elysia";

export const fileRouter = new Elysia({ prefix: "/file" }).get(
	"/:id",
	async ({ params, set }) => {
		const file = await GetFile(params.id);

		set.headers["Content-Type"] = file.contentType;
		set.headers["Content-Disposition"] =
			`attachment; filename="${encodeURIComponent(file.fileName)}"`;
		return file.s3File.stream();
	},
	{
		params: t.Object({
			id: t.String(),
		}),
	},
);
