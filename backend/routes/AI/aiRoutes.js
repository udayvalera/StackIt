const express = require("express");
const { generateAIResponse } = require("../../controllers/AI/aiController");
const router = express.Router();

router.post("/:questionId",generateAIResponse);

module.exports = router;