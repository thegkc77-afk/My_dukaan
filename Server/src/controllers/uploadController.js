import { uploadImage } from '../services/uploadService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const handleImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'NO_FILE', 'No image file uploaded', [], 400);
    }

    const result = await uploadImage(req.file, req.user.shopId);

    return sendSuccess(res, {
      url: result.url,
      publicId: result.publicId,
      format: result.format,
      bytes: result.bytes
    }, 'Image uploaded successfully', 201);
  } catch (error) {
    return sendError(res, 'UPLOAD_ERROR', error.message, [], 500);
  }
};
