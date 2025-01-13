import type { Session, User } from "better-auth/types";
import { auth } from "~/server/auth/auth";

export const userMiddleware = async (
  headers: Record<string, string | undefined>,
) => {
  const realHeaders = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) continue;
    realHeaders.set(key, value);
  }
  return {
    session: await auth.api.getSession({ headers: realHeaders }),
  };
};

export const userInfo = (user: User | null, session: Session | null) => {
  return {
    user: user,
    session: session,
  };
};
