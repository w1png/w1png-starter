import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import { email } from "../email";
import ResetPasswordEmail from "../email/resetPasswordEmail";
import VerificationEmail from "../email/verificationEmail";
import { env } from "~/env";
import SignUpEmail from "../email/signUpEmail";
import { redis } from "../redis";
import { admin } from "better-auth/plugins";
import type { UserRole } from "~/lib/shared/types/user";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  secondaryStorage: {
    get: async (key) => {
      const value = await redis.get(key);
      return value ? value : null;
    },
    set: async (key, value, ttl) => {
      if (ttl) await redis.set(key, value, { EX: ttl });
      else await redis.set(key, value);
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
      console.log(url);
      console.log("SENDING VERIFICATION EMAIL");
      await email.send({
        to: user.email,
        subject: "Подтвердите ваш адрес электронной почты",
        body: VerificationEmail({ url }),
      });
    },
  },
  plugins: [admin()],
});

export type Session = Awaited<ReturnType<(typeof auth)["api"]["getSession"]>>;
