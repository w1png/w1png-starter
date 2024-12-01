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

export const fileRouter = createTRPCRouter({
  create: protectedProcedure
    .input(FileSchema)
    .mutation(async ({ ctx, input }) => {
      const s3Key = await ctx.s3.upload(input);

      const [file] = await ctx.db
        .insert(files)
        .values({
          ...input,
          id: undefined,
          objectId: s3Key,
          createdById: ctx.session.user.id,
        })
        .returning();

      return {
        id: file!.id,
      };
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
