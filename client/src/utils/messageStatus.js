// Works out ✓ (sent), ✓✓ (delivered) or blue ✓✓ (read) for one of MY messages.
// People who turned read receipts off never make a message show as "read".
export const getMessageStatus = (message, conversation, currentUserId) => {
  const recipients = conversation.members.filter((member) => member._id !== currentUserId);

  if (recipients.length === 0) return 'sent';

  const deliveredTo = message.deliveredTo || [];
  const readBy = message.readBy || [];

  const everyoneRead = recipients.every(
    (member) => member.privacy?.readReceipts !== false && readBy.includes(member._id)
  );

  if (everyoneRead) return 'read';

  if (recipients.every((member) => deliveredTo.includes(member._id))) return 'delivered';

  return 'sent';
};