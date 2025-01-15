import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import type { ReactElement } from "react";
import { env } from "~/env";
import { logger } from "~/server/logger";

export class Email {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      secure: true,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASSWORD,
      },
    });
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
        from: env.EMAIL_USER,
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
