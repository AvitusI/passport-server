import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// why were they loaded in the functions only? the env variables

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cldUpload = async (imagePath) => {
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  };

  try {
    const result = await cloudinary.uploader.upload(imagePath, options);
    return result.secure_url;
  } catch (error) {
    console.error(error);
  }
};

export const addImage = async (request, response) => {
  try {
    if (!request.user) {
      return response.status(401).json({ message: "Unauthorized" });
    }

    const { data, mimetype } = request.files.image;
    const base64String = Buffer.from(data).toString("base64");
    const withPrefix = `data:${mimetype};base64,${base64String}`;
    const imageUrl = await cldUpload(withPrefix);

    return response.status(200).json({ status: "ok", imageUrl });
  } catch (error) {
    throw new Error(error);
  }
};
