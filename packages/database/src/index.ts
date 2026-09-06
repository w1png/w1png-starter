import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { user, account, session, verification, files, tests } from "./schema";

const defaultTables = { user, account, session, verification, files, tests };

export class Database {
	readonly tables;
	readonly client;
	readonly connection;
	constructor({
		databaseUrl,
		maxConnections = 10,
		tables = defaultTables,
	}: {
		databaseUrl: string;
		maxConnections?: number;
		tables?: typeof defaultTables;
	}) {
		this.tables = tables;
		this.client = postgres(databaseUrl, {
			max: maxConnections,
			idle_timeout: 20,
			connect_timeout: 10,
		});
		this.connection = drizzle(this.client, { schema: tables });
	}
	async close() {
		await this.client.end({ timeout: 5 });
	}
}
