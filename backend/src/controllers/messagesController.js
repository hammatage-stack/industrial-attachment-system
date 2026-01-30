const Message = require('../models/Message');
const User = require('../models/User');
const socketUtil = require('../utils/socket');

// Get list of conversations for current user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const convs = await Message.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .limit(50)
      .populate('participants', 'firstName lastName email role')
      .lean();

    const result = convs.map(c => {
      const other = c.participants.find(p => p._id.toString() !== userId.toString());
      const last = c.messages && c.messages.length ? c.messages[c.messages.length - 1] : null;
      const unread = c.messages ? c.messages.filter(m => !m.read && m.from.toString() !== userId.toString()).length : 0;
      return {
        _id: c._id,
        participant: other || null,
        lastMessage: last ? last.text : c.lastMessage,
        unread
      };
    });

    return res.json({ success: true, conversations: result });
  } catch (err) {
    console.error('getConversations error', err);
    return res.status(500).json({ success: false, message: 'Error fetching conversations' });
  }
};

// Get messages for a conversation
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const convId = req.params.id;
    const conv = await Message.findById(convId).populate('messages.from', 'firstName lastName email role');
    if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
    if (!conv.participants.map(p => p.toString()).includes(userId.toString())) {
      return res.status(403).json({ success: false, message: 'Not a participant' });
    }

    return res.json({ success: true, messages: conv.messages });
  } catch (err) {
    console.error('getMessages error', err);
    return res.status(500).json({ success: false, message: 'Error fetching messages' });
  }
};

// Send a message to a conversation (or create one)
exports.sendMessage = async (req, res) => {
  try {
    const fromId = req.user._id;
    const convId = req.params.id;
    const { text, participants } = req.body;

    if (!text || !text.trim()) return res.status(400).json({ success: false, message: 'Empty message' });

    let conv = null;
    if (convId === 'new') {
      // create new conversation
      if (!Array.isArray(participants) || !participants.length) {
        return res.status(400).json({ success: false, message: 'Participants required for new conversation' });
      }
      const uniqueParts = Array.from(new Set(participants.concat([fromId.toString()])));
      conv = new Message({ participants: uniqueParts, messages: [] });
    } else {
      conv = await Message.findById(convId);
      if (!conv) return res.status(404).json({ success: false, message: 'Conversation not found' });
      if (!conv.participants.map(p => p.toString()).includes(fromId.toString())) {
        return res.status(403).json({ success: false, message: 'Not a participant' });
      }
    }

    const msg = { from: fromId, text: text.trim(), read: false, createdAt: new Date() };
    conv.messages.push(msg);
    conv.lastMessage = msg.text;
    await conv.save();

    // Emit socket event to conversation room
    try {
      const io = socketUtil.getIO();
      if (io) {
        io.to(conv._id.toString()).emit('message', { conversationId: conv._id, message: msg });
        // also emit to participants rooms
        conv.participants.forEach(p => io.to(p.toString()).emit('message', { conversationId: conv._id, message: msg }));
      }
    } catch (e) {
      console.error('Socket emit failed', e);
    }

    return res.json({ success: true, conversationId: conv._id, message: msg });
  } catch (err) {
    console.error('sendMessage error', err);
    return res.status(500).json({ success: false, message: 'Error sending message' });
  }
};
