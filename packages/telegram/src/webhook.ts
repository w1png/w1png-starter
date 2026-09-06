import "dotenv/config";
import { Telegram } from ".";

async function main() {
	const telegram = new Telegram({
		botToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
		frontendUrl: process.env.FRONTEND_URL ?? "",
		logger: console,
	});
	const webhook = await telegram.configureWebhook(
		process.env.BACKEND_URL ?? "",
	);
	console.log(webhook);
}

main()
	.then(() => {
		process.exit(0);
	})
	.catch((error) => {
		console.error((error as { message: string }).message);
		process.exit(1);
	});
