import winston, { format, transports } from "winston";

export class Logger extends winston.Logger {
	constructor({ prettyLog }: { prettyLog: boolean }) {
		super({
			level: "info",
			format: format.combine(
				format.errors({ stack: true }),
				format.timestamp(),
				prettyLog ? format.prettyPrint() : format.json(),
			),
			transports: [new transports.Console()],
		});
	}
	logApi({
		request,
		path,
		error,
		code,
	}: {
		request: Request;
		path: string;
		error?: unknown;
		code?: string | number;
	}) {
		const event = { method: request.method, path, code, error };
		if (code === "UNKNOWN" || code === "INTERNAL_SERVER_ERROR")
			this.error(event);
		else this.info(event);
	}
}
