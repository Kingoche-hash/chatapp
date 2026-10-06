export const dayKey = (isoDate) => new Date(isoDate).toDateString();

// "Today", "Yesterday", or the full date, for the dividers between days of messages.
export const formatDayLabel = (isoDate) => {
  const date = new Date(isoDate);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
};