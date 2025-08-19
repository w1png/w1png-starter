import { logger } from "@lunarweb/logger";
import type { ValidationError } from "elysia";

const prettyLog = process.env.NODE_ENV !== "production";

export function ApiLogger({
	request,
	path,
	error,
	code,
}: {
	request: Request;
	path: string;
	error?: Readonly<Error> | Readonly<ValidationError> | unknown;
	code?:
		| (
				| number
				| "UNKNOWN"
				| "VALIDATION"
				| "NOT_FOUND"
				| "PARSE"
				| "INTERNAL_SERVER_ERROR"
				| "INVALID_COOKIE_SIGNATURE"
		  )
		| (string & {});
}) {
	const { method, body } = request;

	if (!code) {
		logger.info({
			path,
			method,
		});
		return;
	}

	switch (code) {
		case "VALIDATION":
			prettyLog &&
				console.error(
					`\n 󰛉 Validation not passed \n ${method.toUpperCase()}:${path}`,
				);
			logger.info({
				error,
			});
			prettyLog && console.error(`\n ${JSON.stringify(body)}`);
			return;
		case "UNKNOWN":
		case "INTERNAL_SERVER_ERROR":
			prettyLog &&
				console.error(`\n 󰛉 Server error \n ${method.toUpperCase()}:${path}`);
			logger.error({
				path: `${method.toUpperCase()}:${path}`,
				error,
			});
			prettyLog && console.error("End server error \n");
			return;
	}
}
