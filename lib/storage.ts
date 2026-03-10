import AWS from "aws-sdk";
import { randomUUID } from "crypto";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const BUCKET = process.env.AWS_S3_BUCKET!;

export async function uploadDocument(
  file: Buffer,
  fileName: string,
  mimeType: string,
  loanId: string
): Promise<{ key: string; url: string }> {
  const ext = fileName.split(".").pop() ?? "bin";
  const key = `loans/${loanId}/documents/${randomUUID()}.${ext}`;

  await s3
    .putObject({
      Bucket: BUCKET,
      Key: key,
      Body: file,
      ContentType: mimeType,
      ServerSideEncryption: "AES256",
    })
    .promise();

  // Generate a pre-signed URL valid for 7 days
  const url = s3.getSignedUrl("getObject", {
    Bucket: BUCKET,
    Key: key,
    Expires: 60 * 60 * 24 * 7,
  });

  return { key, url };
}

export async function getDocumentUrl(key: string): Promise<string> {
  return s3.getSignedUrl("getObject", {
    Bucket: BUCKET,
    Key: key,
    Expires: 60 * 60 * 24, // 24 hours
  });
}

export async function getDocumentBuffer(key: string): Promise<Buffer> {
  const result = await s3
    .getObject({ Bucket: BUCKET, Key: key })
    .promise();
  return result.Body as Buffer;
}

export async function deleteDocument(key: string): Promise<void> {
  await s3
    .deleteObject({ Bucket: BUCKET, Key: key })
    .promise();
}
