import { createClient } from "redis";

export class Redis {
	readonly client;
	constructor({
		redisUrl,
		onError,
	}: { redisUrl: string; onError: (error: Error) => void }) {
		this.client = createClient({ url: redisUrl });
		this.client.on("error", onError);
	}
	async connect() {
		await this.client.connect();
	}
	async close() {
		if (this.client.isOpen) await this.client.quit();
	}
}
