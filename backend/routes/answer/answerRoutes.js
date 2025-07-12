const express = require('express');
const router = express.Router();

// Middleware
const authMiddleware = require('../../middleware/authMiddleware');

const { newAnswer, voteAnswer } = require('../../controllers/answer/answerController');

router.use(authMiddleware); // Apply auth middleware to all routes in this file

router.post('/:questionId/new', newAnswer); // Route to post a new answer
router.post('/:answerId/vote', voteAnswer); // Route to vote on an answer

module.exports = router;