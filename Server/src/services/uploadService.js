import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { ENV } from '../config/env.js';

// Configure Cloudinary if credentials are provided
const hasCloudinary = Boolean(
  ENV.CLOUDINARY_CLOUD_NAME &&
  ENV.CLOUDINARY_API_KEY &&
  ENV.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET
  });
}

/**
 * Uploads a file buffer or local file path to storage
 */
export const uploadImage = async (file, shopId) => {
  if (!file) {
    throw new Error('No image file provided');
  }

  // If Cloudinary is available, upload directly
  if (hasCloudinary) {
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `my_dukaan/${shopId}`,
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      if (file.buffer) {
        uploadStream.end(file.buffer);
      } else if (file.path) {
        fs.createReadStream(file.path).pipe(uploadStream);
      } else {
        reject(new Error('Invalid file format'));
      }
    });

    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
      bytes: uploadResult.bytes
    };
  }

  // Fallback to local storage
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const ext = path.extname(file.originalname || '') || '.jpg';
  const filename = `${shopId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
  const targetPath = path.join(uploadsDir, filename);

  if (file.buffer) {
    fs.writeFileSync(targetPath, file.buffer);
  } else if (file.path) {
    fs.copyFileSync(file.path, targetPath);
  }

  return {
    url: `/uploads/${filename}`,
    publicId: filename,
    format: ext.replace('.', ''),
    bytes: file.size || 0
  };
};
