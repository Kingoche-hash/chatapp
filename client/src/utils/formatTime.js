export const formatTime = (isoDate) =>
  new Date(isoDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });