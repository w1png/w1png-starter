import { encode } from "punycode";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { z } from "zod";
import { env } from "~/env";
import type { FileSchema } from "~/lib/shared/types/file";

class S3Storage {
  private readonly s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT,
      credentials: {
        secretAccessKey: env.S3_SECRET_KEY,
        accessKeyId: env.S3_ACCESS_KEY,
      },
    });
  }

  async upload(file: z.infer<typeof FileSchema>): Promise<string> {
    const key = crypto.randomUUID();

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
        Body: file.b64,
        ContentEncoding: "base64",
        ContentType: file.contentType,
        Metadata: {
          fileName: encode(file.fileName),
        },
      }),
    );

    return key;
  }

  async get(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
    });

    const response = await this.s3Client.send(command);
    if (!response.Body) throw Error("S3 response body is undefined");
    return response.Body.transformToString();
  }

  async getSignedUrl(key: string): Promise<string> {
    return await getSignedUrl(
      this.s3Client,
      new GetObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
      }),
      { expiresIn: 3600 },
    );
  }

  async exists(key: string): Promise<boolean> {
    const command = new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
    });
    try {
      await this.s3Client.send(command);
      return true;
    } catch (_) {
      return false;
    }
  }

  async delete(key: string) {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
      }),
    );
  }
}

const globalForS3 = globalThis as unknown as {
  s3: S3Storage | undefined;
};

export const s3 = globalForS3.s3 ?? new S3Storage();
