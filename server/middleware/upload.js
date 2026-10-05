import path from 'path';
import multer from 'multer';
import { AppError } from '../utils/AppError.js';
import { ALLOWED_TYPES, MAX_FILE_SIZE, MAX_FILES } from '../utils/uploadRules.js';

// First lock: is this type of file on the allowed list?
const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const allowedEndings = ALLOWED_TYPES[file.mimetype];

  if (!allowedEndings || !allowedEndings.includes(extension)) {
    return cb(new AppError(`File type not allowed: ${path.basename(file.originalname)}`, 415));
  }

  cb(null, true);
};

// Files are held in memory just long enough to check them and send them to Cloudinary.
export const uploadFiles = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
  fileFilter,
}).array('files', MAX_FILES);