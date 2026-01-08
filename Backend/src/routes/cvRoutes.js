const express = require('express');
const { generateCV, getTemplates, previewCV } = require('../controllers/cvController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// CV Generation routes
router.post('/generate', generateCV);
router.post('/preview', previewCV);
router.get('/templates', getTemplates);

module.exports = router;