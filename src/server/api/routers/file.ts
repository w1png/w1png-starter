import { getPlaiceholder } from "plaiceholder";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { FileSchema } from "~/lib/shared/types/file";
import { IdSchema } from "~/lib/shared/types/utils";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { files } from "~/server/db/schema";
import sharp from "sharp";
import { z } from "zod";

export const fileRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      FileSchema.merge(
        z.object({
          isImage: z.boolean().default(false),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        let buf = Buffer.from(
          input.b64.split(";base64,")[1] ?? input.b64,
          "base64",
        );
        if (input.isImage) {
          buf = await sharp(buf).webp().toBuffer();
        }
        const { id } = (
          await ctx.db
            .insert(files)
            .values({
              ...input,
              placeholder: input.isImage
                ? (
                    await getPlaiceholder(buf)
                  ).base64
                : "",
              objectId: await ctx.s3.upload(
                {
                  ...input,
                  contentType: input.isImage ? "image/webp" : input.contentType,
                },
                buf,
              ),
            })
            .returning()
        )[0]!;

        return {
          id,
        };
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Ошибка загрузки файла",
        });
      }
    }),
  get: publicProcedure.input(IdSchema).query(async ({ ctx, input }) => {
    const file = await ctx.db.query.files.findFirst({
      where: eq(files.id, input.id),
    });

    if (!file) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Файл не найден",
      });
    }

    const presignedUrl = await ctx.s3.getSignedUrl(file.objectId);

    return {
      presignedUrl,
      objectId: file.objectId,
      contentType: file.contentType,
      fileName: file.fileName,
      fileSize: file.fileSize,
    };
  }),
});
