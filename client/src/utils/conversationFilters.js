export const DEFAULT_STATE = {
  pinned: false,
  mutedUntil: null,
  spam: false,
  deletedAt: null,
  wallpaper: 'default',
};

const RETENTION_MS = 30 * 24 * 60 * 60 * 1000; // deleted chats stay for 30 days

export const FILTERS = [
  { key: 'all', label: 'All messages', icon: '💬' },
  { key: 'unread', label: 'Unread', icon: '🔵' },
  { key: 'groups', label: 'Groups', icon: '👥' },
  { key: 'spam', label: 'Spam', icon: '🚫' },
  { key: 'deleted', label: 'Recently deleted', icon: '🗑️' },
];

// My private settings for a chat (with safe defaults).
export const getState = (conversation) => ({ ...DEFAULT_STATE, ...conversation.state });

export const isMuted = (conversation) => {
  const { mutedUntil } = getState(conversation);
  return Boolean(mutedUntil) && new Date(mutedUntil) > new Date();
};

// Appears in the main list: not deleted and not spam.
export const isNormal = (conversation) => {
  const state = getState(conversation);
  return !state.deletedAt && !state.spam;
};

const isRecentlyDeleted = (conversation) => {
  const { deletedAt } = getState(conversation);
  return Boolean(deletedAt) && Date.now() - new Date(deletedAt).getTime() < RETENTION_MS;
};

const matchers = {
  all: (conversation) => isNormal(conversation),
  unread: (conversation) => isNormal(conversation) && (conversation.unreadCount || 0) > 0,
  groups: (conversation) => isNormal(conversation) && conversation.type === 'group',
  spam: (conversation) => {
    const state = getState(conversation);
    return state.spam && !state.deletedAt;
  },
  deleted: (conversation) => isRecentlyDeleted(conversation),
};

export const applyFilter = (conversations, filter) => {
  const matching = conversations.filter(matchers[filter] || matchers.all);

  if (filter === 'deleted') {
    return [...matching].sort(
      (a, b) => new Date(getState(b).deletedAt) - new Date(getState(a).deletedAt)
    );
  }

  // Pinned chats first. The rest keep their newest-first order.
  return [...matching].sort((a, b) => Number(getState(b).pinned) - Number(getState(a).pinned));
};

export const getFilterCounts = (conversations) => ({
  unread: conversations.filter(matchers.unread).length,
  spam: conversations.filter(matchers.spam).length,
  deleted: conversations.filter(matchers.deleted).length,
});

// Unread messages that should count in the browser tab title (not muted, not spam, not deleted).
export const getUnreadTotal = (conversations) =>
  conversations
    .filter((conversation) => isNormal(conversation) && !isMuted(conversation))
    .reduce((sum, conversation) => sum + (conversation.unreadCount || 0), 0);
