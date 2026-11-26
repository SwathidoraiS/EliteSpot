const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const uploadDir = path.join(
  __dirname,
  "../uploads/business-trip"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedExtensions = [
  ".pdf",
  ".doc",
  ".docx",
  ".jpg",
  ".jpeg",
  ".png"
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      `${Date.now()}-${crypto.randomUUID()}` +
      path.extname(file.originalname).toLowerCase();

    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return cb(
        new Error("Only PDF, DOC, DOCX, JPG and PNG files are allowed.")
      );
    }

    cb(null, true);
  }
});

// Validate actual uploaded file content
const validateFileContent = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const { fileTypeFromFile } = await import("file-type");

    const detected = await fileTypeFromFile(req.file.path);
    const extension = path.extname(req.file.originalname).toLowerCase();

    const validTypes = {
      ".pdf": ["application/pdf"],
      ".jpg": ["image/jpeg"],
      ".jpeg": ["image/jpeg"],
      ".png": ["image/png"],
      ".doc": ["application/msword", "application/x-cfb"],
      ".docx": [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ]
    };

    if (!detected || !validTypes[extension]?.includes(detected.mime)) {
      await fs.promises.unlink(req.file.path);

      return res.status(400).json({
        success: false,
        message: "Invalid file content. Please upload a genuine supported file."
      });
    }

    next();

  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      await fs.promises.unlink(req.file.path);
    }

    next(error);
  }
};

// Preserve existing upload import compatibility
module.exports = upload;
module.exports.validateFileContent = validateFileContent;