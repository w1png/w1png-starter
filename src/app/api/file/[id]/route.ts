import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { logger } from "~/lib/server/logger";
import { db } from "~/server/db";
import { files } from "~/server/db/schema";
import { s3 } from "~/server/s3";

export async function GET(
  r: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const file = await db.query.files.findFirst({
      where: eq(files.id, id),
    });

    if (!file) {
      return new Response("Not found", {
        status: 404,
      });
    }

    return new Response(s3.file(file.objectId).stream(), {
      headers: {
        "Content-Type": file.contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(file.fileName)}"`,
      },
    });
  } catch (cause) {
    logger.error({ error: cause, id, url: r.url });
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
