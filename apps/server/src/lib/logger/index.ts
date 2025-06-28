import { createLogger, format, transports } from "winston";

class ConsoleLogger extends transports.Console {
	constructor() {
		super({
			forceConsole: true,
			format: format.combine(format.prettyPrint(), format.errors()),
		});
	}
}

export const logger = createLogger({
	level: "info",
	format: format.combine(format.timestamp(), format.json(), format.errors()),
	transports: [new ConsoleLogger()],
});
