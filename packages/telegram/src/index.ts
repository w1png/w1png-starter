import { env } from "@lunarweb/env";
import { Bot } from "grammy";
import { validate, parse } from "@telegram-apps/init-data-node";

export const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN ?? "");

bot.command("start", async (ctx) => {
	await ctx.reply("hello world!", {
		reply_markup: {
			inline_keyboard: [
				[
					{
						text: "Открыть приложение",
						web_app: {
							url: `${env.FRONTEND_URL}`,
						},
					},
				],
			],
		},
	});
});

export async function AuthenticateTelegramUser(headers: Headers) {
	const initData = headers.get("Authorization");
	console.log({ initData });
	if (!initData) return null;

	const parsedInitData = parse(initData);
	if (!parsedInitData) return null;

	try {
		validate(initData, process.env.TELEGRAM_BOT_TOKEN ?? "");
	} catch (e) {
		console.error(e);
		return null;
	}

	return parsedInitData;
}
