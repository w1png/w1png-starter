import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import type { NextRequest } from "next/server";
import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { s3 } from "~/server/s3";

export async function GET(
	req: NextRequest,
	context: { params: { id: string } },
) {
	const caller = createCaller(
		await createTRPCContext({
			headers: req.headers,
		}),
	);

	try {
		const file = await caller.file.get({
			id: context.params.id,
		});

		return new Response(
			Buffer.from(
				(await s3.get(file.objectId)).split(";base64,").pop()!,
				"base64",
			),
			{
				headers: {
					"Content-Type": file.contentType,
					"Content-Disposition": `attachment; filename="${file.fileName}"`,
					"Content-Encoding": "base64",
				},
			},
		);
	} catch (cause) {
		console.error(cause);
		if (cause instanceof TRPCError) {
			const httpCode = getHTTPStatusCodeFromError(cause);
			return new Response(cause.message, {
				status: httpCode,
			});
		}
		return new Response("Внутренняя ошибка сервера", {
			status: 500,
		});
	}
}
