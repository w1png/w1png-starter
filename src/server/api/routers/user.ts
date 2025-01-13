import Elysia, { error } from "elysia";
import { logger } from "~/server/logger";
import { userMiddleware } from "../middleware/auth";

export const userService = new Elysia({ name: "user/service" })
  .derive(
    { as: "global" },
    async ({ headers }) => await userMiddleware(headers),
  )
  .macro({
    isSignedIn(enabled?: boolean) {
      if (!enabled) return;
      logger.debug({ message: "sign in required" });

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
    isAdmin(enabled?: boolean) {
      if (!enabled) return;

      return {
        beforeHandle({ session }) {
          if (session?.user.role !== "admin")
            return error(401, {
              message: "Только администратор может выполнить это действие",
            });
        },
      };
    },
  });

export const userRouter = new Elysia({ prefix: "/user" })
  .use(userService)
  .get("/", ({ session }) => session);
