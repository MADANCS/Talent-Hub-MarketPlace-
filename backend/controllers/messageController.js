const Message = require('../models/Message');
const Application = require('../models/Application');

// @desc   Get messages for an application
// @route  GET /api/messages/:applicationId
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ application: req.params.applicationId })
      .populate('sender', 'name avatar role')
      .sort('createdAt');
    
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Send a message
// @route  POST /api/messages
const sendMessage = async (req, res) => {
  try {
    const { applicationId, receiverId, content } = req.body;

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      application: applicationId,
      content
    });

    const populatedMessage = await message.populate('sender', 'name avatar role');

    // Notify via socket (logic will be in server.js)
    const io = req.app.get('socketio');
    io.to(receiverId.toString()).emit('new_message', populatedMessage);

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get user's chat list
// @route  GET /api/messages/chats
const getChatList = async (req, res) => {
  try {
    const chats = await Message.aggregate([
      { $match: { $or: [{ sender: req.user._id }, { receiver: req.user._id }] } },
      { $sort: { createdAt: -1 } },
      { $group: {
        _id: "$application",
        lastMessage: { $first: "$$ROOT" },
      }},
      { $lookup: {
        from: 'applications',
        localField: '_id',
        foreignField: '_id',
        as: 'appDetails'
      }},
      { $unwind: "$appDetails" },
      { $lookup: {
        from: 'jobs',
        localField: 'appDetails.job',
        foreignField: '_id',
        as: 'jobDetails'
      }},
      { $unwind: "$jobDetails" }
    ]);

    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMessages, sendMessage, getChatList };
