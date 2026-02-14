// import { Queue, QueueEvents } from "bullmq";
// import { env } from "@lunarweb/env";
// import IORedis from "ioredis";
// import z from "zod/v4";
//
// export const bullConnection = new IORedis(env.REDIS_URL, {
// 	maxRetriesPerRequest: null,
// });
//
export const QUEUE_NAME = "queue-name";
// export const queueNameQueue = new Queue<
// 	z.infer<typeof InputSchema>,
// 	z.infer<typeof OutputSchema>
// >(QUEUE_NAME, {
// 	connection: bullConnection,
// });
// export const queueNameEvents = new QueueEvents(
// 	QUEUE_NAME,
// 	{ connection: bullConnection },
// );
