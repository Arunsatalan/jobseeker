const router = require('express').Router();
const { protect } = require('../middleware/auth');
const messageController = require('../controllers/messagingController');

// Protected routes
router.post('/', protect, messageController.sendMessage);
router.get('/conversation/:userId', protect, messageController.getConversation);
router.get('/', protect, messageController.getConversations);
router.put('/:id/read', protect, messageController.markAsRead);

module.exports = router;
