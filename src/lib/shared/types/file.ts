import { z } from "zod";

export const MAX_FILE_SIZE_MB = 5;

export const FileSchema = z.object({
  fileName: z
    .string({
      required_error: "Необходимо указать имя файла",
      invalid_type_error: "Неверный тип имени файла",
    })
    .min(1, "Необходимо указать имя файла"),
  contentType: z
    .string({
      message: "Неверный тип файла",
    })
    .min(1, "Неверный тип файла"),
  fileSize: z
    .number({
      required_error: "Необходимо указать размер файла",
      invalid_type_error: "Неверный тип размера файла",
    })
    .min(1, "Необходимо указать размер файла")
    .max(
      MAX_FILE_SIZE_MB * 1024 * 1024,
      `Размер файла не может быть больше ${MAX_FILE_SIZE_MB} МБ`,
    ),
  b64: z
    .string({
      required_error: "Необходимо указать base64 строку",
      invalid_type_error: "Неверный тип base64 строки",
    })
    .min(1, "Необходимо указать base64 строку"),
});

export type ProcessedFile = z.infer<typeof FileSchema>;
