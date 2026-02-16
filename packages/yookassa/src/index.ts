import {
	type ICheckoutCustomer,
	type IItem,
	YooCheckout,
} from "@a2seven/yoo-checkout";
import { env } from "@lunarweb/env";
import { logger } from "@lunarweb/logger";

export const paymentStatuses = [
	"pending",
	"waiting_for_capture",
	"succeeded",
	"canceled",
] as const;

export class Yookassa {
	private yookassa: YooCheckout;

	constructor() {
		this.yookassa = new YooCheckout({
			shopId: process.env.YOOKASSA_SHOP_ID ?? "",
			secretKey: process.env.YOOKASSA_SECRET_KEY ?? "",
		});
	}

	async createPayment({
		amount,
		redirectPath,
	}: {
		amount: number;
		redirectPath: string;
	}) {
		const idempotencyKey = Bun.randomUUIDv7();
		try {
			logger.info({
				message: "Creating payment",
				amount,
				redirectPath,
			});
			const yookassaPayment = await this.yookassa.createPayment(
				{
					amount: {
						value: amount.toFixed(0).toString(),
						currency: "RUB",
					},
					confirmation: {
						type: "redirect",
						return_url: `${redirectPath}`,
					},
					capture: true,
				},
				idempotencyKey,
			);
			logger.info({
				message: "Payment created",
				id: yookassaPayment.id,
			});
			const confirmationUrl = yookassaPayment.confirmation.confirmation_url;
			if (!confirmationUrl) {
				logger.error({
					message: "Payment confirmation url is not found",
				});
				throw new Error("Не удалось создать платеж");
			}

			return { yookassaPayment, idempotencyKey };
		} catch (error) {
			logger.error({
				message: "Payment failed",
				error,
			});

			throw new Error("Не удалось создать платеж");
		}
	}

	async createReceipt({
		items,
		paymentId,
		amount,
		customer,
	}: {
		items: IItem[];
		paymentId: string;
		amount: number;
		customer: ICheckoutCustomer;
	}) {
		const receipt = await this.yookassa.createReceipt({
			send: true,
			payment_id: paymentId,
			type: "payment",
			items,
			customer,
			settlements: [
				{
					type: "prepayment",
					amount: {
						value: amount.toFixed(2).toString(),
						currency: "RUB",
					},
				},
			],
		});

		console.log(receipt);

		return receipt.id;
	}
}

const globalForYookassa = globalThis as unknown as {
	yookassa: Yookassa;
};

export const yookassa = globalForYookassa.yookassa ?? new Yookassa();
