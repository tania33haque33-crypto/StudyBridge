const Discussion = require('../models/Discussion');
const { emitToAll, emitToUser } = require('../config/socket');

// ─── GET all discussions (with country + category filter, search, pagination)
exports.getDiscussions = async (req, res, next) => {
  try {
    const { country, category, search, page = 1, limit = 15, sort = 'latest' } = req.query;
    const query = { isActive: true };

    if (country) query.country = country;
    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const sortMap = {
      latest: { isPinned: -1, createdAt: -1 },
      oldest: { isPinned: -1, createdAt: 1 },
      popular: { isPinned: -1, views: -1, replyCount: -1 },
      mostReplied: { isPinned: -1, replyCount: -1 },
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [discussions, total] = await Promise.all([
      Discussion.find(query)
        .sort(sortMap[sort] || sortMap.latest)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('author', 'firstName lastName profilePicture role')
        .select('-replies'),
      Discussion.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: discussions,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      page: parseInt(page),
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET single discussion + increment views
exports.getDiscussion = async (req, res, next) => {
  try {
    const discussion = await Discussion.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'firstName lastName profilePicture role createdAt')
      .populate('replies.author', 'firstName lastName profilePicture role');

    if (!discussion || !discussion.isActive) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    // Filter deleted replies
    discussion.replies = discussion.replies.filter((r) => !r.isDeleted);

    res.status(200).json({ success: true, data: discussion });
  } catch (error) {
    next(error);
  }
};

// ─── GET country stats (discussion counts per country)
exports.getCountryStats = async (req, res, next) => {
  try {
    const stats = await Discussion.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$country', count: { $sum: 1 }, lastActivity: { $max: '$updatedAt' } } },
      { $sort: { count: -1 } },
    ]);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

// ─── CREATE discussion
exports.createDiscussion = async (req, res, next) => {
  try {
    const { title, content, country, category, tags } = req.body;

    const discussion = await Discussion.create({
      title,
      content,
      country,
      category,
      tags: tags || [],
      author: req.user._id,
    });

    await discussion.populate('author', 'firstName lastName profilePicture role');

    // Notify country room via socket
    emitToAll('discussion:new', { discussion, country });

    res.status(201).json({ success: true, data: discussion });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE discussion (author or admin)
exports.updateDiscussion = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found' });

    const isOwner = discussion.author.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'moderator'].includes(req.user.role);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const allowed = ['title', 'content', 'category', 'tags'];
    if (isAdmin) allowed.push('isPinned', 'isLocked', 'isActive');

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) discussion[field] = req.body[field];
    });

    await discussion.save();
    await discussion.populate('author', 'firstName lastName profilePicture role');

    res.status(200).json({ success: true, data: discussion });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE discussion (author or admin)
exports.deleteDiscussion = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found' });

    const isOwner = discussion.author.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'moderator'].includes(req.user.role);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    discussion.isActive = false;
    await discussion.save();

    res.status(200).json({ success: true, message: 'Discussion deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── LIKE / UNLIKE discussion
exports.toggleLike = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found' });

    const userId = req.user._id.toString();
    const liked = discussion.likes.some((id) => id.toString() === userId);

    if (liked) {
      discussion.likes = discussion.likes.filter((id) => id.toString() !== userId);
    } else {
      discussion.likes.push(req.user._id);
    }

    await discussion.save();
    res.status(200).json({ success: true, liked: !liked, likeCount: discussion.likes.length });
  } catch (error) {
    next(error);
  }
};

// ─── ADD reply
exports.addReply = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found' });
    if (discussion.isLocked) return res.status(400).json({ success: false, message: 'Discussion is locked' });

    const reply = { content: req.body.content, author: req.user._id };
    discussion.replies.push(reply);
    discussion.replyCount = discussion.replies.filter((r) => !r.isDeleted).length;
    await discussion.save();

    await discussion.populate('replies.author', 'firstName lastName profilePicture role');
    const newReply = discussion.replies[discussion.replies.length - 1];

    // Notify discussion author
    if (discussion.author.toString() !== req.user._id.toString()) {
      emitToUser(discussion.author.toString(), 'discussion:reply', {
        discussionId: discussion._id,
        discussionTitle: discussion.title,
        replyAuthor: `${req.user.firstName} ${req.user.lastName}`,
      });
    }

    res.status(201).json({ success: true, data: newReply });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE reply
exports.deleteReply = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found' });

    const reply = discussion.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ success: false, message: 'Reply not found' });

    const isOwner = reply.author.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'moderator'].includes(req.user.role);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    reply.isDeleted = true;
    discussion.replyCount = discussion.replies.filter((r) => !r.isDeleted).length;
    await discussion.save();

    res.status(200).json({ success: true, message: 'Reply deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── LIKE / UNLIKE reply
exports.toggleReplyLike = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found' });

    const reply = discussion.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ success: false, message: 'Reply not found' });

    const userId = req.user._id.toString();
    const liked = reply.likes.some((id) => id.toString() === userId);

    if (liked) {
      reply.likes = reply.likes.filter((id) => id.toString() !== userId);
    } else {
      reply.likes.push(req.user._id);
    }

    await discussion.save();
    res.status(200).json({ success: true, liked: !liked, likeCount: reply.likes.length });
  } catch (error) {
    next(error);
  }
};

// ─── ACCEPT reply as answer (discussion author only)
exports.acceptReply = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found' });

    if (discussion.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the discussion author can accept an answer' });
    }

    // Unaccept all others
    discussion.replies.forEach((r) => { r.isAccepted = false; });

    const reply = discussion.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ success: false, message: 'Reply not found' });
    reply.isAccepted = true;

    await discussion.save();
    res.status(200).json({ success: true, message: 'Reply accepted as answer' });
  } catch (error) {
    next(error);
  }
};

// ─── GET my discussions
exports.getMyDiscussions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [discussions, total] = await Promise.all([
      Discussion.find({ author: req.user._id, isActive: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('author', 'firstName lastName profilePicture')
        .select('-replies'),
      Discussion.countDocuments({ author: req.user._id, isActive: true }),
    ]);

    res.status(200).json({ success: true, data: discussions, total });
  } catch (error) {
    next(error);
  }
};
