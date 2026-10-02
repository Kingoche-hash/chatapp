import { Router } from 'express';
import {
  createConversation,
  getMyConversations,
  getConversationById,
} from '../controllers/conversation.controller.js';
import { sendMessage, getConversationMessages } from '../controllers/message.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  conversationIdParams,
  createConversationSchema,
  sendMessageSchema,
  messageQuerySchema,
} from '../validators/conversation.validators.js';

const router = Router();

router.use(protect);

router.post('/', validate(createConversationSchema), createConversation);
router.get('/', getMyConversations);

router.get('/:conversationId', validate(conversationIdParams, 'params'), getConversationById);

router.get(
  '/:conversationId/messages',
  validate(conversationIdParams, 'params'),
  validate(messageQuerySchema, 'query'),
  getConversationMessages
);

router.post(
  '/:conversationId/messages',
  validate(conversationIdParams, 'params'),
  validate(sendMessageSchema),
  sendMessage
);

export default router;