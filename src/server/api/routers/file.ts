import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
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
    .input(
      FileSchema.merge(
        z.object({
          createdById: z
            .string({
              required_error: "Необходимо указать идентификатор автора",
              invalid_type_error: "Неверный тип идентификатора автора",
            })
            .min(1, "Необходимо указать идентификатор автора"),
          ticketId: z
            .string({
              required_error: "Необходимо указать идентификатор обращения",
              invalid_type_error: "Неверный тип идентификатора обращения",
            })
            .min(1, "Необходимо указать идентификатор обращения"),
          messageId: z
            .string({
              invalid_type_error: "Неверный тип идентификатора сообщения",
            })
            .optional(),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const s3Key = await ctx.s3.upload(input);

      await ctx.db.insert(files).values({
        ...input,
        id: undefined,
        objectId: s3Key,
      });

      return {
        key: s3Key,
      };
    }),
  get: publicProcedure.input(IdSchema).query(async ({ ctx, input }) => {
    const file = await ctx.db.query.files.findFirst({
      where: eq(files.id, input.id),
      with: {
        ticket: true,
      },
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
