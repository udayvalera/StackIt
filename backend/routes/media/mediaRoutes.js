const express = require('express');
const router = express.Router();

// Middleware
const authMiddleware = require('../../middleware/authMiddleware');

const { uploadQuestionImage, upload } = require('../../controllers/media/questionMediaController');


router.use(authMiddleware);
// Route to upload question image
router.post('/upload-question-image', upload.single("image"), uploadQuestionImage);

module.exports = router;