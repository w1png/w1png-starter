import { TestSchema } from "@lunarweb/shared/schemas";
import { protectedProcedure } from "../orpc";
import { db } from "@lunarweb/database";
import { tests } from "@lunarweb/database/schema";
import { eq, isNull } from "drizzle-orm";
import z from "zod/v4";

export const testRouter = {
  create: protectedProcedure.input(TestSchema)
  .handler(async ({input}) => {
    await db.insert(tests).values(input);
  }),
  update: protectedProcedure.input(TestSchema.extend({
    id: z.string()
  }))
  .handler(async ({input}) => {
    await db.update(tests).set(input).where(eq(tests.id, input.id));
  }),
  delete: protectedProcedure.input(z.object({
    id: z.string()
  })).handler(async ({input}) => {
    await db.update(tests).set({deletedAt: new Date()}).where(eq(tests.id, input.id))
  }),
  getAll: protectedProcedure.handler(async () => await db.query.tests.findMany({
    where: isNull(tests.deletedAt)
  }))
};
