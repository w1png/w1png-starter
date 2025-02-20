import { Telegraf } from "telegraf";
import { env } from "~/env";

export const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);

bot.start(async (ctx) => {
  await ctx.reply("Привет, это стартовое сообщение", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Начать",
            web_app: {
              url: `${env.AUTH_TRUST_HOST}`,
            },
          },
        ],
      ],
    },
  });

  // Устанавливаем кнопку слева от сообщения
  await ctx.setChatMenuButton({
    text: "Начать",
    type: "web_app",
    web_app: {
      url: env.AUTH_TRUST_HOST,
    },
  });
});

export default bot;
