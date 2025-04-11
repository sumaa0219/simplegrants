import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { MemoryStoredFile } from 'nestjs-form-data';

@Injectable()
export class AwsService {
  async uploadFile(file: MemoryStoredFile, name: string) {
    const client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
    });

    const filename = `${name}.${
      file.extension || (file as any).fileType.ext || ''
    }`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filename,
      Body: file.buffer,
    };

    const command = new PutObjectCommand(params);

    try {
      client.send(command);
    } catch (err) {
      throw err;
    }

    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
  }

  /**
   * Uploads a data buffer to AWS
   * @param data Image buffer
   * @param name
   * @returns
   */
  async uploadBuffer(data: Buffer, name: string) {
    const client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
    });

    const filename = `${name}.png`; // Should always be PNG based on `generateCollage` function

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filename,
      Body: data,
    };

    const command = new PutObjectCommand(params);

    try {
      client.send(command);
    } catch (err) {
      throw err;
    }

    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
  }
}
