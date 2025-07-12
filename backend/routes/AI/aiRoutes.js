const express = require("express");
const { generateAIResponse } = require("../../controllers/AI/aiController");
const router = express.Router();

// Route to generate AI response for any question data
router.post("/generate", generateAIResponse);

module.exports = router;