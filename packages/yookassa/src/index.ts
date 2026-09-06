import {
	type ICheckoutCustomer,
	type IItem,
	YooCheckout,
} from "@a2seven/yoo-checkout";

export const paymentStatuses = [
	"pending",
	"waiting_for_capture",
	"succeeded",
	"canceled",
] as const;

export interface YookassaLogger {
	info(event: unknown): unknown;
	error(event: unknown): unknown;
}

export class Yookassa {
	constructor(
		private readonly dependencies: {
			client: YooCheckout;
			logger: YookassaLogger;
			createId?: () => string;
		},
	) {}

	async createPayment({
		amount,
		redirectPath,
	}: {
		amount: number;
		redirectPath: string;
	}) {
		const idempotencyKey =
			this.dependencies.createId?.() ?? crypto.randomUUID();
		try {
			this.dependencies.logger.info({
				message: "Creating payment",
				amount,
				redirectPath,
			});
			const yookassaPayment = await this.dependencies.client.createPayment(
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
			this.dependencies.logger.info({
				message: "Payment created",
				id: yookassaPayment.id,
			});
			const confirmationUrl = yookassaPayment.confirmation.confirmation_url;
			if (!confirmationUrl) {
				this.dependencies.logger.error({
					message: "Payment confirmation url is not found",
				});
				throw new Error("Не удалось создать платеж");
			}

			return { yookassaPayment, idempotencyKey };
		} catch (error) {
			this.dependencies.logger.error({
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
		const receipt = await this.dependencies.client.createReceipt({
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

		return receipt.id;
	}
}

export function createYookassaClient({
	shopId,
	secretKey,
}: {
	shopId: string;
	secretKey: string;
}) {
	return new YooCheckout({ shopId, secretKey });
}
