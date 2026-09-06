import { Bot } from "grammy";
import { validate, parse } from "@telegram-apps/init-data-node";

export interface TelegramLogger {
	error(error: unknown): unknown;
}

export class Telegram {
	readonly bot: Bot;

	constructor(
		private readonly dependencies: {
			botToken: string;
			frontendUrl: string;
			logger: TelegramLogger;
		},
	) {
		this.bot = new Bot(dependencies.botToken);
		this.registerCommands();
	}

	authenticate(headers: Headers) {
		const initData = headers.get("Authorization");
		if (!initData) return null;

		try {
			validate(initData, this.dependencies.botToken);
			return parse(initData);
		} catch (error) {
			this.dependencies.logger.error(error);
			return null;
		}
	}

	async configureWebhook(backendUrl: string) {
		await this.bot.api.deleteWebhook();
		await this.bot.api.setWebhook(
			new URL("/api/telegram", backendUrl).toString(),
			{
				allowed_updates: [
					"chat_member",
					"message",
					"inline_query",
					"callback_query",
					"shipping_query",
					"pre_checkout_query",
				],
			},
		);
		return this.bot.api.getWebhookInfo();
	}

	private registerCommands() {
		this.bot.command("start", (context) =>
			context.reply("hello world!", {
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: "Открыть приложение",
								web_app: { url: this.dependencies.frontendUrl },
							},
						],
					],
				},
			}),
		);
	}
}
