const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

router.use(auth);

// Halaman utama chat (daftar room)
router.get('/rooms', chatController.getRooms);

// Chat room komunitas
router.get('/room/:roomId', chatController.getRoomChat);

// Private chat routes
router.get('/private', auth, chatController.getPrivateChats);
router.get('/private/:userId', auth, chatController.getPrivateChatRoom);
router.get('/users/search', auth, chatController.searchUsers);

// Search User
router.get('/search-users', auth, chatController.searchUsers);

module.exports = router;