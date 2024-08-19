import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from "fs";

import { config } from "dotenv";

config();
export const uploadtoS3 = async (path, originalFilename, mimetype) => {
  const bucket = process.env.BUCKET_NAME;
  const client = new S3Client({
    region: "ap-southeast-2",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });

  const parts = originalFilename.split(".");
  const ext = parts[parts.length - 1];
  const newFilename = Date.now() + "." + ext;
  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Body: fs.readFileSync(path),
        Key: newFilename,
        ContentType: mimetype,
        ACL: "public-read",
      })
    );
  } catch (error) {
    console.log(error);
    return "error";
  }
  return `https://${bucket}.s3.amazonaws.com/${newFilename}`;
};
