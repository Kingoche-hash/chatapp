// The name to show for a person: their display name, or their username if they have none.
export const getDisplayName = (person) => person?.displayName || person?.username || 'Unknown';

export const getOtherMember = (conversation, currentUserId) =>
  conversation.members.find((member) => member._id !== currentUserId);

export const getConversationTitle = (conversation, currentUserId) => {
  if (conversation.type === 'group') {
    return conversation.name || 'Group';
  }

  return getDisplayName(getOtherMember(conversation, currentUserId));
};