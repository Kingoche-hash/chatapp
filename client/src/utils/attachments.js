export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file
export const MAX_FILES = 5;

// What the file picker offers. The server checks again, so this is just for quick feedback.
export const ACCEPT = '.jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx';
const ALLOWED_EXTENSIONS = ACCEPT.split(',');

export const isImage = (mimeType = '') => mimeType.startsWith('image/');

export const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// A smaller, faster copy of an image (Cloudinary makes it on the fly).
export const thumbnailUrl = (url) =>
  url.replace('/upload/', '/upload/w_600,c_limit,q_auto,f_auto/');

// Returns a message describing the first problem, or '' if all files are fine.
export const validateFiles = (files) => {
  if (files.length > MAX_FILES) {
    return `You can attach at most ${MAX_FILES} files at once.`;
  }

  for (const file of files) {
    const dot = file.name.lastIndexOf('.');
    const extension = dot >= 0 ? file.name.slice(dot).toLowerCase() : '';

    if (!ALLOWED_EXTENSIONS.includes(extension)) return `"${file.name}" is not an allowed file type.`;
    if (file.size === 0) return `"${file.name}" is empty.`;
    if (file.size > MAX_FILE_SIZE) return `"${file.name}" is larger than 10 MB.`;
  }

  return '';
};