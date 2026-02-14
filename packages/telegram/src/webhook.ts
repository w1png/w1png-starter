import { env } from "@lunarweb/env";
import { bot } from ".";

async function Webhook() {
	const del = await bot.api.deleteWebhook();
	const set = await bot.api.setWebhook(`${env.BACKEND_URL}/api/telegram`, {
		allowed_updates: [
			"chat_member",
			"message",
			"inline_query",
			"callback_query",
			"shipping_query",
			"pre_checkout_query",
			"shipping_query",
		],
	});
	const get = await bot.api.getWebhookInfo();

	console.log({ del, set, get });
}

Webhook()
	.then(() => {
		process.exit(0);
	})
	.catch((error) => {
		console.error((error as { message: string }).message);
		process.exit(1);
	});
