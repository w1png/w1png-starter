import { GetTelegramAuth } from "~/server/telegram/auth";

export const userMiddleware = async (
  headers: Record<string, string | undefined>,
) => {
  const realHeaders = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) continue;
    realHeaders.set(key, value);
  }

  return {
    session: {
      user: await GetTelegramAuth(realHeaders),
    },
  };
};
