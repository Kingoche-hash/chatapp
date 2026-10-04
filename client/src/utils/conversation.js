export const getOtherMember = (conversation, currentUserId) =>
  conversation.members.find((member) => member._id !== currentUserId);

export const getConversationTitle = (conversation, currentUserId) => {
  if (conversation.type === 'group') {
    return conversation.name || 'Group';
  }

  return getOtherMember(conversation, currentUserId)?.username || 'Unknown';
};