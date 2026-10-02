import { searchUsers } from '../services/user.service.js';

export const searchUsersHandler = async (req, res) => {
  const { search, limit } = req.valid.query;
  const users = await searchUsers({ search, limit, currentUserId: req.user._id });
  res.status(200).json({ users });
};