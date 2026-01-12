import { Injectable } from "@nestjs/common";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class WasabiService  {
    
    private s3: S3Client;
    private bucket = process.env.WASABI_BUCKET!;

    constructor() {
        this.s3 = new S3Client({
        endpoint: process.env.WASABI_ENDPOINT,
        region: process.env.WASABI_REGION,
        credentials: {
            accessKeyId: process.env.WASABI_ACCESS_KEY!,
            secretAccessKey: process.env.WASABI_SECRET_KEY!,
        },
        });
    }
    
    async uploadPdf(
        key: string,
        buffer: Buffer,
    ): Promise<String>{
        await this.s3.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: buffer,
                ContentType: 'application/pdf',
            }),
        );

        return `${process.env.WASABI_ENDPOINT}/${this.bucket}/${key}`;
    }
}