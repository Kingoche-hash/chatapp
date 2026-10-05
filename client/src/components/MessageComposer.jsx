import { useRef, useState } from 'react';
import { ACCEPT, formatFileSize, validateFiles } from '../utils/attachments';

export default function MessageComposer({ onSend, onSendFiles, onTyping, onStopTyping }) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(null);

  const fileInputRef = useRef(null);

  const handleChange = (event) => {
    const value = event.target.value;
    setText(value);

    if (value.trim()) onTyping();
    else onStopTyping();
  };

  const handleFilesChosen = (event) => {
    const chosen = Array.from(event.target.files);
    event.target.value = ''; // lets you pick the same file again later

    if (chosen.length === 0) return;

    const combined = [...files, ...chosen];
    const problem = validateFiles(combined);

    if (problem) {
      setError(problem);
      return;
    }

    setError('');
    setFiles(combined);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, position) => position !== index));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const content = text.trim();
    if ((!content && files.length === 0) || sending) return;

    setSending(true);
    setError('');

    try {
      if (files.length > 0) {
        setProgress(0);
        await onSendFiles(files, content, setProgress);
        setFiles([]);
      } else {
        await onSend(content);
      }

      setText('');
      onStopTyping();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
      setProgress(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-700 p-3">
      {error && (
        <p role="alert" className="mb-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {files.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex max-w-full items-center gap-2 rounded-lg bg-slate-700 px-2 py-1 text-xs"
            >
              <span aria-hidden="true">📎</span>
              <span className="truncate">
                {file.name} ({formatFileSize(file.size)})
              </span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                disabled={sending}
                aria-label={`Remove ${file.name}`}
                className="text-slate-400 hover:text-white disabled:opacity-50"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {sending && progress !== null && (
        <p className="mb-2 text-xs text-slate-400">
          {progress < 100 ? `Uploading... ${progress}%` : 'Processing...'}
        </p>
      )}

      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPT}
          onChange={handleFilesChosen}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending}
          aria-label="Attach files"
          title="Attach files"
          className="rounded-lg bg-slate-700 px-3 py-2 hover:bg-slate-600 disabled:opacity-50"
        >
          📎
        </button>

        <input
          type="text"
          value={text}
          onChange={handleChange}
          onBlur={onStopTyping}
          maxLength={4000}
          placeholder={files.length > 0 ? 'Add a caption (optional)' : 'Type a message'}
          aria-label="Message"
          className="flex-1 rounded-lg bg-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <button
          type="submit"
          disabled={sending || (!text.trim() && files.length === 0)}
          className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </form>
  );
}