import { parse, validate } from "@telegram-apps/init-data-node";
import { eq } from "drizzle-orm";
import { env } from "~/env";
import { db } from "../db";
import { error } from "elysia";
import { user } from "../db/schema";

export async function GetTelegramAuth(headers: Headers) {
  const initDataRaw = headers.get("x-init-data");

  if (!initDataRaw) {
    throw error(401);
  }

  try {
    validate(initDataRaw, env.TELEGRAM_BOT_TOKEN);
  } catch (_error) {
    console.error(_error);
    throw error(401);
  }
  const initData = parse(initDataRaw);

  if (!initData || !initData.user) {
    throw error(401);
  }

  let userdb = await db.query.user.findFirst({
    where: eq(user.telegramId, initData.user.id.toString()),
    columns: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      telegramId: true,
      role: true,
    },
  });

  if (userdb) return userdb;

  userdb = (
    await db
      .insert(user)
      .values({
        ...initData.user,
        id: crypto.randomUUID(),
        username: initData.user.username,
        telegramId: initData.user.id.toString(),
        role:
          initData.user!.id.toString() === env.MAIN_ADMIN_ID ? "admin" : "user",
      })
      .onConflictDoNothing()
      .returning({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        telegramId: user.telegramId,
        role: user.role,
      })
  )[0]!;

  return {
    ...userdb,
  };
}
