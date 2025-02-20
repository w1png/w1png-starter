import Elysia, { error } from "elysia";
import { userMiddleware } from "../middleware/auth";
import type { UserRole } from "~/lib/shared/types/user";

export const userService = new Elysia({ name: "user/service" })
  .derive({ as: "global" }, async ({ headers }) => {
    return await userMiddleware(headers);
  })
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
  });

export const userRouter = new Elysia({ prefix: "/user" })
  .use(userService)
  .get("/", ({ session }) => session);
