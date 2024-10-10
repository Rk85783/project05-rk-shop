import fs from "fs";
import { mediaUpload } from "../services/media.service.js";
import { errorMessages } from "../utils/messages.js";

export const mediaAdd = async (req, res) => {
  try {
    const files = Array.isArray(req.files?.image) ? req.files.image : [req.files?.image];

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: "No image files uploaded" });
    }

    const mediaResponses = await Promise.all(files.map(async (file) => {
      const response = await mediaUpload(file.tempFilePath);
      fs.unlink(file.tempFilePath, err => err && console.error(`Failed to delete temp file: ${file.tempFilePath}`, err));
      return response;
    }));

    res.status(200).json({
      success: true,
      message: "Media uploaded successfully",
      data: mediaResponses.map(({ public_id, secure_url }) => ({ public_id, secure_url }))
    });
  } catch (error) {
    console.error("Error in mediaAdd:", error);
    res.status(500).json({ success: false, message: errorMessages.INTERNAL_SERVER_ERROR });
  }
};
