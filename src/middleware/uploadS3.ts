import { Request } from "express";
import * as multer from "multer";
import * as multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import * as dotenv from "dotenv";

dotenv.config();

interface KeyCallback {
  (error: Error | null, key: string): void;
}

const s3 = new S3Client({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "illustcomm-bucket",
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req: Request, file: Express.Multer.File, cb: KeyCallback) {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
});
