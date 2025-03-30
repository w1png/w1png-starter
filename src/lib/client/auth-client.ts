import { createAuthClient } from "better-auth/react";

let baseURL = "";
if (typeof window !== "undefined") {
  baseURL = window.location.origin;
}

export const authClient = createAuthClient({
  baseURL,
});

export type ErrorTypes = Partial<
  Record<keyof typeof authClient.$ERROR_CODES, string>
>;

export const errorCodes = {
  USER_ALREADY_EXISTS: "Пользователь с таким Email уже существует",
  USER_EMAIL_NOT_FOUND: "Пользователь с таким Email не найден",
  PASSWORD_TOO_LONG: "Пароль слишком длинный",
  PASSWORD_TOO_SHORT: "Пароль слишком короткий",
  INVALID_EMAIL: "Неверный формат Email",
  ACCOUNT_NOT_FOUND: "Аккаунт не найден",
  INVALID_EMAIL_OR_PASSWORD: "Неверный Email или пароль",
  INVALID_PASSWORD: "Неверный пароль",
  EMAIL_CAN_NOT_BE_UPDATED: "Не удалось обновить Email",
  EMAIL_NOT_VERIFIED: "Email не подтвержден",
} satisfies ErrorTypes;
