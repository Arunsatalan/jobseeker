const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const messageController = require('../controllers/messagingController');
const templateController = require('../controllers/messageTemplateController');

// Message routes
router.post('/', protect, messageController.sendMessage);
router.post('/bulk', protect, authorize('employer'), messageController.sendBulkMessages);
router.get('/conversation/:userId', protect, messageController.getConversation);
router.get('/', protect, messageController.getConversations);
router.get('/analytics', protect, messageController.getMessagingAnalytics);
router.get('/flagged', protect, authorize('admin'), messageController.getFlaggedMessages);
router.put('/:id/read', protect, messageController.markAsRead);
router.put('/:id/moderate', protect, authorize('admin'), messageController.updateModerationStatus);

// Template routes
router.post('/templates', protect, templateController.createTemplate);
router.get('/templates', protect, templateController.getTemplates);
router.get('/templates/:id', protect, templateController.getTemplate);
router.put('/templates/:id', protect, templateController.updateTemplate);
router.delete('/templates/:id', protect, templateController.deleteTemplate);

module.exports = router;
