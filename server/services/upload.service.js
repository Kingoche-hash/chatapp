import crypto from 'crypto';
import path from 'path';
import { cloudinary } from '../config/cloudinary.js';
import { AppError } from '../utils/AppError.js';
import { hasValidSignature } from '../utils/fileSignature.js';

const FOLDER = 'chatapp/attachments';

const resourceTypeFor = (mimeType) => (mimeType.startsWith('image/') ? 'image' : 'raw');

// Keeps only safe characters from the name the user's computer gave the file.
const safeFileName = (name) =>
  path
    .basename(name)
    .replace(/[^\w.\- ()]/g, '_')
    .slice(-120);

const uploadOne = (file) =>
  new Promise((resolve, reject) => {
    const resourceType = resourceTypeFor(file.mimetype);
    const extension = path.extname(file.originalname).toLowerCase();
    const id = crypto.randomUUID();

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: FOLDER,
        resource_type: resourceType,
        // Random name. Documents keep their ending so browsers know what they are.
        public_id: resourceType === 'raw' ? `${id}${extension}` : id,
        overwrite: false,
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );

    stream.end(file.buffer);
  });

export const deleteAttachments = async (attachments) => {
  await Promise.allSettled(
    attachments.map((attachment) =>
      cloudinary.uploader.destroy(attachment.publicId, {
        resource_type: resourceTypeFor(attachment.mimeType),
      })
    )
  );
};

// Second lock (real contents), then the upload. Returns the tags to save in MongoDB.
export const uploadAttachments = async (files) => {
  for (const file of files) {
    if (!hasValidSignature(file)) {
      throw new AppError(
        `"${safeFileName(file.originalname)}" is not a real ${path.extname(file.originalname).toLowerCase()} file`,
        415
      );
    }
  }

  const results = await Promise.allSettled(files.map(uploadOne));

  const attachments = [];
  let failed = false;

  results.forEach((result, index) => {
    const file = files[index];

    if (result.status === 'fulfilled') {
      attachments.push({
        url: result.value.secure_url,
        publicId: result.value.public_id,
        fileName: safeFileName(file.originalname),
        mimeType: file.mimetype,
        size: file.size,
      });
    } else {
      failed = true;
      console.error('Cloudinary upload error:', result.reason?.message);
    }
  });

  if (failed) {
    // All or nothing: remove the ones that did go through.
    await deleteAttachments(attachments);
    throw new AppError('Upload failed. Please try again.', 502);
  }

  return attachments;
};