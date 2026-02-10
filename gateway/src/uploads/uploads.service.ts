import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';

@Injectable()
export class UploadsService {
  private s3: S3Client;
  private bucket = process.env.WASABI_BUCKET!;

  constructor() {
    this.s3 = new S3Client({
      endpoint: process.env.WASABI_ENDPOINT,
      region: process.env.WASABI_REGION ?? 'us-east-1',
      credentials: {
        accessKeyId: process.env.WASABI_ACCESS_KEY!,
        secretAccessKey: process.env.WASABI_SECRET_KEY!,
      },
      forcePathStyle: true,
    });
  }

  async createPresignedUploads(count: number) {
    const uploads: {
      key: string;
      uploadUrl: string;
      viewUrl: string;
    }[] = [];

    for (let i = 0; i < count; i++) {
      const key = `products/${randomUUID()}.webp`;

      // ⬆️ PUT
      const uploadCommand = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: 'image/webp',
      });

      const uploadUrl = await getSignedUrl(
        this.s3,
        uploadCommand,
        { expiresIn: 60 },
      );

      // 👀 GET (debug / admin opcional)
      const viewCommand = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const viewUrl = await getSignedUrl(
        this.s3,
        viewCommand,
        { expiresIn: 60 * 60 },
      );

      uploads.push({
        key,
        uploadUrl,
        viewUrl,
      });
    }

    return uploads;
  }

  async getProductImageStream(key: string): Promise<Readable> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.s3.send(command);

    return response.Body as Readable;
  }
}
