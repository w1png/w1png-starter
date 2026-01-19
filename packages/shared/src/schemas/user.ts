export const userRoles = ["ADMIN", "USER"] as const;
export type UserRole = (typeof userRoles)[number];

export const userRoleNames: Record<UserRole, string> = {
	ADMIN: "Администратор",
	USER: "Пользователь",
};
