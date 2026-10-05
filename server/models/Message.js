import mongoose from 'mongoose';

const { Schema } = mongoose;

const attachmentSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: String,
    fileName: String,
    mimeType: String,
    size: Number,
  },
  { _id: false }
);

const messageSchema = new Schema(
  {
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, trim: true, maxlength: 4000, default: '' },
    attachments: { type: [attachmentSchema], default: [] },
    deliveredTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Fast paging inside one conversation.
messageSchema.index({ conversation: 1, _id: -1 });

// Fast word search in message text. "none" means no language-specific guessing,
// so it works the same for English, Lithuanian and any other language.
messageSchema.index({ content: 'text' }, { default_language: 'none' });

export default mongoose.model('Message', messageSchema);