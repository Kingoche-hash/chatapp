import api from './api';

export const fetchConversations = async () => {
  const res = await api.get('/conversations');
  return res.data.conversations;
};

export const fetchMessages = async (conversationId, { before, limit = 30 } = {}) => {
  const res = await api.get(`/conversations/${conversationId}/messages`, {
    params: { limit, before },
  });
  return res.data;
};

export const searchUsersRequest = async (search) => {
  const res = await api.get('/users', { params: { search } });
  return res.data.users;
};

export const startDirectConversation = async (userId) => {
  const res = await api.post('/conversations', { type: 'direct', userId });
  return res.data.conversation;
};