import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import type { ReactElement } from "react";

export interface EmailLogger {
	error(error: unknown): unknown;
}

export class Email {
	constructor(
		private readonly dependencies: {
			from: string;
			logger: EmailLogger;
			transporter: nodemailer.Transporter;
		},
	) {}

	async send({
		body,
		subject,
		to,
	}: {
		body: ReactElement;
		subject: string;
		to: string;
	}) {
		try {
			await this.dependencies.transporter.sendMail({
				from: this.dependencies.from,
				to,
				subject,
				html: await render(body),
			});
		} catch (error) {
			this.dependencies.logger.error({ error, to, subject });
		}
	}
}

export function createEmailTransport(options?: nodemailer.TransportOptions) {
	return nodemailer.createTransport(options);
}
