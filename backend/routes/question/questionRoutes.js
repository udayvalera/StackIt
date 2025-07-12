const express = require('express');
const router = express.Router();

// Middleware 
const authMiddleware = require('../../middleware/authMiddleware')


const { newQuestion } = require('../../controllers/question/newQuestionController');






router.use(authMiddleware); // Apply auth middleware to all routes in this file

/**
 * @route POST /api/question/new
 * @desc Create a new question
 * @access Private (requires authentication)
 */
router.post('/new', newQuestion);

module.exports = router;