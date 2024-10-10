import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true
});

export const mediaUpload = (tempFilePath) => {
  return cloudinary.uploader.upload(tempFilePath, {
    folder: "project05-rk-shop"
    // public_id: customFileName // Specify the custom file name
  });
};
