export const redis = Bun.redis;

export async function ServeCached<T>(
	key: string,
	ttl: number,
	fn: () => Promise<T>,
) {
	const value = await redis.get(key);

	if (value) {
		return JSON.parse(value) as T;
	}
	const value_1 = await fn();
	redis.set(key, JSON.stringify(value_1), "EX", ttl);
	return value_1;
}
