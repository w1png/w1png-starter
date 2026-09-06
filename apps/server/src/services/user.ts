import { z } from "zod";
import type { Context } from "../context";
import { eq } from "drizzle-orm";

const AdminCredentialsSchema = z.object({
	email: z.email(),
	password: z.string(),
});
const AdminAccountSchema = AdminCredentialsSchema.omit({
	password: true,
}).extend({ name: z.string(), passwordHash: z.string() });

export class UserService {
	private readonly context;
	private readonly hashPassword;
	constructor({
		context,
		hashPassword,
	}: {
		context: Context;
		hashPassword: (password: string) => Promise<string>;
	}) {
		this.context = context;
		this.hashPassword = hashPassword;
	}
	async ensureMainAdmin({
		email,
		password,
	}: z.infer<typeof AdminCredentialsSchema>) {
		const existing = await this.context.db.connection.query.user.findFirst({
			where: eq(this.context.db.tables.user.email, email),
		});
		if (existing) return;
		const passwordHash = await this.hashPassword(password);
		await this.createAdmin({ email, name: "Admin", passwordHash });
	}
	private async createAdmin(input: z.infer<typeof AdminAccountSchema>) {
		const users = this.context.db.tables.user;
		const accounts = this.context.db.tables.account;
		await this.context.db.connection.transaction(async (tx) => {
			const now = new Date();
			const [created] = await tx
				.insert(users)
				.values({
					id: crypto.randomUUID(),
					email: input.email,
					name: input.name,
					role: "ADMIN",
					emailVerified: false,
					createdAt: now,
					updatedAt: now,
				})
				.onConflictDoNothing({ target: users.email })
				.returning({ id: users.id });
			if (!created) return;
			await tx.insert(accounts).values({
				id: crypto.randomUUID(),
				accountId: created.id,
				userId: created.id,
				providerId: "credential",
				password: input.passwordHash,
				createdAt: now,
				updatedAt: now,
			});
		});
	}
}
