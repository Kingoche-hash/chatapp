const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Shows the text with the searched words marked in yellow.
export default function HighlightedText({ text, query }) {
  const terms = query
    .replace(/"/g, ' ')
    .split(/\s+/)
    .filter((term) => term && !term.startsWith('-'));

  if (terms.length === 0) return <>{text}</>;

  const pattern = new RegExp(`(${terms.map(escapeRegex).join('|')})`, 'gi');
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <mark key={index} className="rounded bg-amber-300 px-0.5 text-slate-900">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}