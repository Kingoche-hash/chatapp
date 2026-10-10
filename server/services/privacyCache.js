// The privacy switches of people who are connected, kept in memory so that typing and
// presence events can check them instantly. (One server process; see Phase 10 for scaling.)
const DEFAULTS = { showPresence: true, readReceipts: true, typingIndicators: true };

const cache = new Map();

// Turns a user document into three plain true/false values.
export const pickPrivacy = (user) => ({
  showPresence: user.privacy?.showPresence !== false,
  readReceipts: user.privacy?.readReceipts !== false,
  typingIndicators: user.privacy?.typingIndicators !== false,
});

export const setPrivacy = (userId, privacy) => {
  cache.set(userId.toString(), { ...DEFAULTS, ...privacy });
};

export const getPrivacy = (userId) => cache.get(userId.toString()) ?? DEFAULTS;