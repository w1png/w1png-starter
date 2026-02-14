import type { orpc } from "@/lib/orpc";

export type Session = NonNullable<
	Awaited<ReturnType<typeof orpc.user.session.get.call>>
>;
