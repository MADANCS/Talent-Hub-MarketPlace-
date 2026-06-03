const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, getChatList } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/chats', getChatList);
router.get('/:applicationId', getMessages);
router.post('/', sendMessage);

module.exports = router;
