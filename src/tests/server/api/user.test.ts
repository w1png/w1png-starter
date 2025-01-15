import { treaty } from "@elysiajs/eden";
import { describe, expect, test } from "bun:test";
import Elysia from "elysia";
import { userMiddleware } from "~/server/api/middleware/auth";
import { userService } from "~/server/api/routers/user";
import { CreateUser } from "~/tests/create-user";

describe("user", () => {
  test("auth.middleware.authorized", async () => {
    const { user, headers } = await CreateUser();
    const session = await userMiddleware(headers);
    const sessionUser = session.session?.user;

    expect(sessionUser).toBeTruthy();
    expect({
      id: sessionUser?.id,
      email: sessionUser?.email,
      name: sessionUser?.name,
      image: sessionUser?.image,
      emailVerified: sessionUser?.emailVerified,
      createdAt: sessionUser?.createdAt,
      updatedAt: sessionUser?.updatedAt,
    }).toEqual(user);
  });

  test("auth.middleware.unauthorized", async () => {
    const session = await userMiddleware({});
    const sessionUser = session.session?.user;

    expect(sessionUser).toBeFalsy();
  });

  test("auth.unprotected", async () => {
    const app = new Elysia({ prefix: "/api" }).use(userService);
    const a = app.get("/test", () => ({ message: "passed" }));

    const api = treaty(a);
    const res = await api.api.test.get();
    expect(res.data?.message).toBe("passed");
    expect(res.error).toBeFalsy();
  });

  test("auth.unauthorized", async () => {
    const app = new Elysia({ prefix: "/api" }).use(userService);
    const a = app.get("/test", () => ({ message: "passed" }), {
      isSignedIn: true,
    });

    const api = treaty(a);
    const res = await api.api.test.get();
    expect(res.data).toBeFalsy();
    expect(res.error).toBeTruthy();
  });

  test("auth.user", async () => {
    const { headers } = await CreateUser();

    const app = new Elysia({ prefix: "/api" }).use(userService);
    const a = app.get("/test", () => ({ message: "passed" }), {
      isSignedIn: true,
    });

    const api = treaty(a);
    const res = await api.api.test.get({
      headers,
    });
    expect(res.data?.message).toBe("passed");
    expect(res.error).toBeFalsy();
  });

  test("auth.admin", async () => {
    const { headers } = await CreateUser("admin@example.com");

    const app = new Elysia({ prefix: "/api" }).use(userService);
    const a = app.get("/test", () => ({ message: "passed" }), {
      hasRole: "admin",
    });

    const api = treaty(a);
    const res = await api.api.test.get({
      headers,
    });
    expect(res.data?.message).toBe("passed");
    expect(res.error).toBeFalsy();
  });

  test("auth.admin.notAdmin", async () => {
    const { headers } = await CreateUser();

    const app = new Elysia({ prefix: "/api" }).use(userService);
    const a = app.get("/test", () => ({ message: "passed" }), {
      hasRole: "admin",
    });

    const api = treaty(a);
    const res = await api.api.test.get({
      headers,
    });
    expect(res.data).toBeFalsy();
    expect(res.error).toBeTruthy();
  });

  test("auth.admin.unauthorized", async () => {
    const app = new Elysia({ prefix: "/api" }).use(userService);
    const a = app.get("/test", () => ({ message: "passed" }), {
      hasRole: "admin",
    });

    const api = treaty(a);
    const res = await api.api.test.get();
    expect(res.data).toBeFalsy();
    expect(res.error).toBeTruthy();
  });
});
