import { formatFileSize, isImage, thumbnailUrl } from '../utils/attachments';

export default function AttachmentList({ attachments }) {
  if (!attachments?.length) return null;

  return (
    <div className="mb-1 space-y-2">
      {attachments.map((attachment) =>
        isImage(attachment.mimeType) ? (
          <a key={attachment.publicId} href={attachment.url} target="_blank" rel="noopener noreferrer" className="block">
            <img src={thumbnailUrl(attachment.url)} alt={attachment.fileName} loading="lazy" className="max-h-64 max-w-full rounded-lg object-cover" />
          </a>
        ) : (
          <a key={attachment.publicId} href={attachment.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2 hover:bg-black/30">
            <span aria-hidden="true">📄</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{attachment.fileName}</span>
              <span className="block text-xs text-slate-300/80">{formatFileSize(attachment.size)}</span>
            </span>
          </a>
        )
      )}
    </div>
  );
}
