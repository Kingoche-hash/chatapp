export const formatDateTime = (isoDate) =>
  new Date(isoDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });