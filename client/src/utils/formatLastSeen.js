export const formatLastSeen = (isoDate) => {
  if (!isoDate) return 'Offline';

  const date = new Date(isoDate);
  const now = new Date();
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (date.toDateString() === now.toDateString()) {
    return `Last seen today at ${time}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return `Last seen yesterday at ${time}`;
  }

  return `Last seen ${date.toLocaleDateString()} at ${time}`;
};