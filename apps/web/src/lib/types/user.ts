import type { orpc } from "@/utils/orpc";

export type Session = NonNullable<
	Awaited<ReturnType<typeof orpc.user.session.get.call>>
>;
