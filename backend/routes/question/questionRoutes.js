const express = require('express');
const router = express.Router();

// Middleware 
const authMiddleware = require('../../middleware/authMiddleware')
const guestMiddleware = require('../../middleware/guestMiddleware');


const { newQuestion, getQuestions, getQuestionById } = require('../../controllers/question/questionController');



router.get('/', guestMiddleware, getQuestions); // Public route to get all questions
router.get('/:id', guestMiddleware, getQuestionById); // Public route to get a question by ID


router.use(authMiddleware); // Apply auth middleware to all routes in this file

/**
 * @route POST /api/question/new
 * @desc Create a new question
 * @access Private (requires authentication)
 */
router.post('/new', newQuestion);

module.exports = router;