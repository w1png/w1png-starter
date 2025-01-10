import { TRPCError } from "@trpc/server";
import mime from "mime-types";
import { getPlaiceholder } from "plaiceholder";
import sharp from "sharp";
import { z } from "zod";
import { FileSchema } from "~/lib/shared/types/file";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { files } from "~/server/db/schema";

export const fileRouter = createTRPCRouter({
  test: protectedProcedure.query(() => console.log("test")),
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
        let buf: Buffer = Buffer.from(
          input.b64.split(";base64,")[1] ?? input.b64,
          "base64",
        );
        if (input.isImage) {
          buf = await sharp(buf).webp().toBuffer();
        }
        const placeholder = input.isImage
          ? (await getPlaiceholder(buf)).base64
          : undefined;
        const objectId = crypto.randomUUID();
        const mimeType = mime.extension(input.fileName);
        const metadata = ctx.s3.file(objectId);
        await metadata.write(buf, {
          type: mimeType ? mimeType : "application/octet-stream",
        });

        const [file] = await ctx.db
          .insert(files)
          .values({
            ...input,
            placeholder,
            objectId,
          })
          .returning();

        return {
          id: file!.id,
        };
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Ошибка загрузки файла",
        });
      }
    }),
});
