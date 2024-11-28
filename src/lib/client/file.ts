import mime from "mime-types";
import type { z } from "zod";
import type { FileSchema } from "../shared/types/file";

async function FilesToBase64<F extends readonly File[]>(
  files: F,
): Promise<{ [K in keyof F]: string }> {
  const filesBase64 = await Promise.all(
    files.map(async (image) => {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = (error) => reject(error);
      });
      return base64;
    }),
  );

  return filesBase64 as { [K in keyof F]: string };
}

export function ConvertFiles<F extends readonly File[]>(
  files: F,
): Promise<z.infer<typeof FileSchema>[]> {
  return Promise.all(
    files.map(async (file) => {
      const b64 = await FilesToBase64([file] as const);

      return {
        fileName: file.name,
        contentType: mime.contentType(file.name) || "application/octet-stream",
        fileSize: file.size,
        b64: b64[0],
      };
    }),
  );
}
