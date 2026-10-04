// Works out ✓ (sent), ✓✓ (delivered) or blue ✓✓ (read) for one of MY messages.
export const getMessageStatus = (message, conversation, currentUserId) => {
  const recipients = conversation.members
    .map((member) => member._id)
    .filter((id) => id !== currentUserId);

  if (recipients.length === 0) return 'sent';

  const deliveredTo = message.deliveredTo || [];
  const readBy = message.readBy || [];

  if (recipients.every((id) => readBy.includes(id))) return 'read';
  if (recipients.every((id) => deliveredTo.includes(id))) return 'delivered';

  return 'sent';
};