import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { env } from "~/env";
import type { UserRole } from "~/lib/shared/types/user";
import { db } from "../db";
import { email } from "../email";
import ResetPasswordEmail from "../email/resetPasswordEmail";
import SignUpEmail from "../email/signUpEmail";
import VerificationEmail from "../email/verificationEmail";
import { logger } from "../logger";
import { redis } from "../redis";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  secondaryStorage: {
    get: async (key) => {
      const value = await redis.get(key);
      return value ? value : null;
    },
    set: async (key, value) => {
      await redis.set(key, value);
    },
    delete: async (key) => {
      await redis.del(key);
    },
  },
  user: {
    additionalFields: {
      // role: {
      //   type: "string",
      //   required: true,
      //   defaultValue: "USER" as UserRole,
      //   input: false,
      // },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: (user) =>
          new Promise((resolve) =>
            resolve({
              data: {
                ...user,
                role: (user.email === env.MAIN_ADMIN_EMAIL
                  ? "admin"
                  : "user") as UserRole,
              },
            }),
          ),
        after: async (user) => {
          logger.info({ message: "Sending SignUp Email", user });
          await email.send({
            to: user.email,
            subject: "Спасибо за регистрацию",
            body: SignUpEmail(),
          });
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      logger.info({ message: "Sending reset Email", user, url });
      await email.send({
        to: user.email,
        subject: "Восстановление пароля",
        body: ResetPasswordEmail({ url }),
      });
    },
    requireEmailVerification: env.NODE_ENV !== "test",
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      logger.info({ message: "Sending verification Email", user, url });
      await email.send({
        to: user.email,
        subject: "Подтвердите ваш адрес электронной почты",
        body: VerificationEmail({ url }),
      });
    },
  },
  plugins: [
    admin({
      defaultRole: "user",
    }),
  ],
});

export type Session = NonNullable<
  Awaited<ReturnType<(typeof auth)["api"]["getSession"]>>
>;
export type User = Session["user"];

export async function GetCachedSession(userId: string) {
  const sessionTokensRaw = await redis.get(`active-sessions-${userId}`);

  if (!sessionTokensRaw) {
    logger.warn({
      message: "unable to invalidate session",
    });

    return;
  }

  const sessionTokens = (
    JSON.parse(sessionTokensRaw) as {
      token: string;
      expiresAt: number;
    }[]
  ).map((t) => t.token);
  if (!sessionTokens[0]) {
    logger.warn({
      message: "unable to invalidate session",
      details: "session tokens are empty",
    });
    return;
  }

  let tokenCache: string | null = null;
  for (const token of sessionTokens) {
    tokenCache = await redis.get(token);
    if (tokenCache) break;
  }
  if (!tokenCache) {
    logger.warn({
      message: "token cache not found",
    });

    return;
  }

  const session = JSON.parse(tokenCache) as Session;

  return { session, sessionTokens };
}

export async function UpdateCachedSession(
  userId: string,
  newSession: (oldSession: Session) => Promise<Session> | Session,
) {
  const sess = await GetCachedSession(userId);
  if (sess) {
    const { sessionTokens, session } = sess;
    const newSess = newSession(session);
    await Promise.all(
      sessionTokens.map(async (token) => {
        await redis.set(token, JSON.stringify(newSess));
      }),
    );
    logger.info({
      message: "updated cached user sessions",
      sessionTokens,
      newSession: newSess,
    });
  } else {
    logger.warn({
      message: "unable to update cached user session",
    });
  }
}
