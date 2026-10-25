import multer from "multer";

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
    files: 1,
  },
  fileFilter(req, file, callback) {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(
        new Error("Signature must be a JPEG, PNG, or WebP image."),
      );
    }

    callback(null, true);
  },
});

export default upload;
