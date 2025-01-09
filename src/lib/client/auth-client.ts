import { createAuthClient } from "better-auth/react";

let baseURL = "";
if (typeof window !== "undefined") {
  baseURL = window.location.origin;
}

export const authClient = createAuthClient({
  baseURL,
});

export const authErrorCodes = {
  // [authClient.$ERROR_CODES.USER_ALREADY_EXISTS]: {
  //   ru: "Пользователь с таким email уже существует",
  // },
  // [authClient.$ERROR_CODES.EMAIL_NOT_VERIFIED]: {
  //   ru: "Подтвердите ваш email для входа в аккаунт",
  // },
  // [authClient.$ERROR_CODES.INVALID_PASSWORD]: {
  //   ru: "Неверный пароль",
  // },
  // [authClient.$ERROR_CODES.INVALID_EMAIL]: {
  //   ru: "Неверный email или пароль",
  // },
};
