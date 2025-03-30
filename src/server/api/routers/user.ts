import Elysia, { Context, error } from "elysia";
import { userMiddleware } from "../middleware/auth";
import type { UserRole } from "~/lib/shared/types/user";
import { auth } from "~/server/auth/auth";

export const userService = new Elysia({ name: "user/service" })
  .derive(
    { as: "global" },
    async ({ headers }) => await userMiddleware(headers),
  )
  .macro({
    hasRole: (role?: UserRole) => {
      if (!role) return;

      return {
        beforeHandle({ session }) {
          if (session?.user?.role !== role)
            return error(401, {
              message:
                "Для выполнения этого действия необходимо быть администратором",
            });
        },
      };
    },
    isSignedIn: (enabled?: boolean) => {
      if (!enabled) return;

      return {
        beforeHandle({ session }) {
          if (!session?.user)
            return error(401, {
              message:
                "Для выполнения этого действия необходимо авторизоваться",
            });
        },
      };
    },
  });

const betterAuthView = (context: Context) => {
  console.log({ context });
  const BETTER_AUTH_ACCEPT_METHODS = ["POST", "GET"];
  if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
    return auth.handler(context.request);
  } else {
    context.error(405);
  }
};

const userRouterPrefix = new Elysia({ prefix: "/user" })
  .use(userService)
  .get("/session", ({ session }) => session);

export const userRouter = new Elysia()
  .all("/auth/*", betterAuthView)
  .use(userRouterPrefix);
