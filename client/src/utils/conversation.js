export const getConversationTitle = (conversation, currentUserId) => {
  if (conversation.type === 'group') {
    return conversation.name || 'Group';
  }

  const other = conversation.members.find((member) => member._id !== currentUserId);
  return other?.username || 'Unknown';
};