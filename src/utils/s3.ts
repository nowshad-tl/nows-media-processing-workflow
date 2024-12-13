// src/utils/s3.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";
const bucketName = process.env.AWS_S3_BUCKET_NAME;
if (!bucketName) {
    throw new Error("AWS_S3_BUCKET_NAME is not set in environment variables");
}

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
});

/**
 * Upload a file to S3 and return a presigned URL for temporary access.
 * The object is stored privately by default (no ACL).
 *
 * @param key The S3 object key (path/filename).
 * @param body The file contents as a Buffer.
 * @param contentType The MIME type of the file (e.g., "audio/mpeg").
 * @param expiresIn The number of seconds the presigned URL is valid for. Default: 3600 (1 hour).
 * @returns A presigned URL that allows temporary download of the object.
 */
export async function uploadFileToS3(key: string, body: Buffer, contentType: string, expiresIn = 3600): Promise<string> {
    // Upload the file
    await s3.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
    }));

    // Generate a presigned URL for temporary access
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn });
    return signedUrl;
}

/**
 * Retrieves a file from S3 as a readable stream.
 *
 * @param key The S3 object key
 * @returns A Node.js Readable stream of the file contents
 */
export async function getObjectStream(key: string): Promise<NodeJS.ReadableStream> {
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
    });

    const response = await s3.send(command);

    if (!response.Body || !(response.Body instanceof Readable)) {
        throw new Error("Expected a readable stream from S3");
    }

    return response.Body;
}
