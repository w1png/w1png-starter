import { logger } from "@lunarweb/logger";
import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import type { ReactElement } from "react";

export class Email {
	private transporter: nodemailer.Transporter;

	constructor() {
		this.transporter = nodemailer.createTransport();
		// {
		// 			host: process.env.EMAIL_HOST,
		// 			port: process.env.EMAIL_PORT,
		// 			secure: true,
		// 			auth: {
		// 				user: process.env.EMAIL_USER,
		// 				pass: process.env.EMAIL_PASSWORD,
		// 			},
		// 		}
	}

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
			this.transporter.sendMail({
				from: process.env.EMAIL_USER,
				to,
				subject: subject,
				html: await render(body),
			});
		} catch (error) {
			logger.error({ error, to, subject });
		}
	}
}

const globalForEmail = globalThis as unknown as {
	email: Email | undefined;
};

export const email = globalForEmail.email ?? new Email();
