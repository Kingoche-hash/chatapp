export default function MessageStatus({ status }) {
  if (status === 'read') {
    return (
      <span title="Read" aria-label="Read" className="font-bold text-sky-300">
        ✓✓
      </span>
    );
  }

  if (status === 'delivered') {
    return (
      <span title="Delivered" aria-label="Delivered">
        ✓✓
      </span>
    );
  }

  return (
    <span title="Sent" aria-label="Sent">
      ✓
    </span>
  );
}