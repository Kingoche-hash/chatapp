import path from 'path';

// A file's label can lie. This peeks at the first bytes to see what it REALLY is.
const startsWith = (buffer, bytes) =>
  buffer.length >= bytes.length && bytes.every((byte, index) => buffer[index] === byte);

const isZip = (buffer) => startsWith(buffer, [0x50, 0x4b, 0x03, 0x04]); // docx, xlsx, pptx
const isOle = (buffer) => startsWith(buffer, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]); // doc, xls, ppt
const isText = (buffer) => !buffer.subarray(0, 8000).includes(0); // real text has no zero bytes

const SIGNATURES = {
  'image/jpeg': (b) => startsWith(b, [0xff, 0xd8, 0xff]),
  'image/png': (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  'image/gif': (b) => startsWith(b, [0x47, 0x49, 0x46, 0x38]),
  'image/webp': (b) =>
    b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP',
  'application/pdf': (b) => b.toString('ascii', 0, 5) === '%PDF-',
  'text/plain': isText,
  'text/csv': isText,
  'application/msword': isOle,
  'application/vnd.ms-excel': isOle,
  'application/vnd.ms-powerpoint': isOle,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': isZip,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': isZip,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': isZip,
};

export const hasValidSignature = (file) => {
  if (!file.buffer || file.buffer.length === 0) return false;

  const extension = path.extname(file.originalname).toLowerCase();

  // A .csv file is plain text, whatever label the computer gave it.
  if (extension === '.csv') return isText(file.buffer);

  const check = SIGNATURES[file.mimetype];
  return check ? check(file.buffer) : false;
};