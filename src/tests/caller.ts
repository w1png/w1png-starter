import { createCaller } from "~/server/api/root";
import { auth, type Session } from "~/server/auth/auth";
import { db } from "~/server/db";
import { redis } from "~/server/redis";
import { s3 } from "~/server/s3";

export async function CreateUser() {
  const user = await auth.api.signUpEmail({
    body: {
      email: "test@example.com",
      password: "test1234",
      name: "Test User",
      role: "user",
    },
  });

  const { token } = await auth.api.signInEmail({
    body: { email: "test@example.com", password: "test1234" },
  });

  return {
    user,
    token,
  };
}

export function setupCaller(opts: {
  headers: Headers;
  session: Session | null;
}) {
  return createCaller({
    db,
    redis,
    s3,
    ...opts,
  });
}

export type Caller = ReturnType<typeof setupCaller>;
