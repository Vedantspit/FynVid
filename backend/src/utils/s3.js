import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import path from "path";

// Renamed instance to s3Client (lowercase) to avoid conflict with Class name
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadToS3 = async (localFilePath, folder) => {
  if (!localFilePath) return null;

  try {
    const fileStream = fs.createReadStream(localFilePath);
    const fileName = `${Date.now()}-${path.basename(localFilePath)}`;
    const key = `${folder}/${fileName}`;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: fileStream,
      ContentType: folder === "thumbnails" ? "image/jpeg" : "video/mp4",
      // If your bucket is private, you don't need ACL here.
      // Cloudfront or Signed URLs will handle access.
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // Clean up local file
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);

    return {
      key: key,
      // For thumbnails: return the public URL
      // For videos: return the key (to be signed later)
      url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
  } catch (error) {
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    console.error("S3 Upload Error:", error);
    return null;
  }
};

export const getPrivateVideoUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  // This generates a temporary URL valid for 1 hour
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};
