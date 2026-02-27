import AutoAdmin from "@/components/auto-admin";
import { TestSchema } from "@lunarweb/shared/schemas";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/tests/")(
	AutoAdmin({
		schema: TestSchema,
		router: "tests",
		header: "тест",
		config: {
			actions: {
				delete: true,
				update: false,
				additionalActions: ["hello world!"],
			},
			fields: {
				bool: {
					label: "Логическое поле",
					type: "checkbox",
					placeholder: "Я согласен с чем-то",
				},
				name: {
					label: "Название",
					placeholder: "Введите название",
					selectFrom: () =>
						Promise.resolve([
							{
								id: "1",
								name: "Первый",
							},
							{
								id: "2",
								name: "Второй",
							},
							{
								id: "3",
								name: "Третий",
							},
						]),
				},

				imageId: {
					type: "file",
					label: "Фото",
				},
				imageIds: {
					type: "file",
					fileType: "image/png",
					label: "Несколько фото",
				},
				arr: {
					label: "Массив",
					placeholder: "Введите значение",
					selectFrom: () =>
						Promise.resolve([
							{
								id: "1",
								name: "Первый",
							},
							{
								id: "2",
								name: "Второй",
							},
							{
								id: "3",
								name: "Третий",
							},
						]),
				},
			},
		},
	}),
);
