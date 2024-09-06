import { z } from "zod";
import { userRoleEnum } from "~/server/db/schema";

export const userRoleEnumSchema = z.enum(userRoleEnum.enumValues, {
  required_error: "Необходимо указать роль пользователя",
  invalid_type_error: "Неверный тип роли пользователя",
});
export type UserRole = z.infer<typeof userRoleEnumSchema>;
