export * from "./bull";

export const redis = Bun.redis;
export type Key = (string | undefined)[];

export async function ServeCached<T>(
	key: Key,
	ttl: number,
	fn: () => Promise<T>,
) {
	const k = key
		.filter((segment): segment is string => segment != null)
		.join(":");
	const value = await redis.get(k);

	if (value) {
		return JSON.parse(value) as T;
	}
	const value_1 = await fn();
	if (value_1) {
		await redis.set(k, JSON.stringify(value_1), "EX", ttl);
	}
	return value_1;
}

export async function InvalidateCached(key: Key) {
	const pattern = key
		.filter((segment): segment is string => segment != null)
		.join(":")
		.concat("*");
	const keys = await redis.keys(pattern);
	if (keys.length > 0) {
		await redis.del(...keys);
	}
}

export const DEFAULT_TTL = 60 * 60 * 24;
