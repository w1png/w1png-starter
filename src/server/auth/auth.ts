import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import { email } from "../email";
import ResetPasswordEmail from "../email/resetPasswordEmail";
import VerificationEmail from "../email/verificationEmail";
import { env } from "~/env";
import type { UserRole } from "~/lib/shared/types/user";
import SignUpEmail from "../email/signUpEmail";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "USER" as UserRole,
        input: false,
      },
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
                  ? "ADMIN"
                  : "USER") as UserRole,
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
    requireEmailVerification: true,
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
});
