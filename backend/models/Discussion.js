const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  content: { type: String, required: true, trim: true, maxlength: 3000 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isAccepted: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

const discussionSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 200 },
  content: { type: String, required: [true, 'Content is required'], trim: true, maxlength: 5000 },
  country: { type: String, required: [true, 'Country is required'], trim: true },
  category: {
    type: String,
    enum: ['General', 'Visa & Immigration', 'Accommodation', 'Scholarships', 'University Life', 'Language & Culture', 'Jobs & Career', 'Cost of Living', 'Pre-Departure'],
    default: 'General',
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [{ type: String, maxlength: 30 }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  replies: [replySchema],
  replyCount: { type: Number, default: 0 },
  isPinned: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

discussionSchema.index({ country: 1, category: 1, createdAt: -1 });
discussionSchema.index({ title: 'text', content: 'text', tags: 'text' });
discussionSchema.index({ author: 1 });

module.exports = mongoose.model('Discussion', discussionSchema);
