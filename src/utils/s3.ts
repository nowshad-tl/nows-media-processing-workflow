// src/utils/s3.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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

export async function uploadFileToS3(key: string, body: Buffer, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
    ACL: "public-read", // If you want the file to be publicly accessible
  });

  await s3.send(command);

  // Return the public URL of the uploaded file.
  // This assumes your bucket is set to allow public reads if ACL: 'public-read' is used
  // Otherwise, you may need to generate a pre-signed URL for access.
  return `https://${bucketName}.s3.amazonaws.com/${encodeURIComponent(key)}`;
}
