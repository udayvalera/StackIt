const {PrismaClient} = require('../../generated/prisma')

const prisma = new PrismaClient();
/**
 * Handles the creation of a new question.
 * This function simulates the logic of an Express.js controller.
 * @param {object} req - The request object, with req.user populated by auth middleware.
 * @param {object} res - The response object.
 */
const newQuestion = async (req, res) => {
  try {
    // 1. Get Authenticated User ID from request object
    // In a real Express app, middleware would populate req.user.
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required. User not found.' });
    }

    // 2. Extract and Validate Input
    const { title, description, tags } = req.body;

    if (!title || title.trim().length < 10) {
      return res.status(400).json({ message: 'Title is required and must be at least 10 characters long.' });
    }
    if (!description || !description.type || !Array.isArray(description.content)) {
      return res.status(400).json({ message: 'Description is required and must be a valid JSON structure.' });
    }
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ message: 'At least one tag is required.' });
    }

    // 3. Prepare Data for Prisma
    // The schema expects a specific format for creating/connecting related tags.
    const tagOperations = tags.map(tagName => ({
      where: { name: tagName },
      create: { name: tagName },
    }));

    const questionData = {
      title,
      description, // The JSON from the rich text editor
      author: {
        connect: { id: userId }, // Connect using the ID from req.user
      },
      tags: {
        connectOrCreate: tagOperations,
      },
    };

    // 4. Create Question in Database
    const newQuestion = await prisma.question.create({
      data: questionData,
    });

    // 5. Send Success Response
    return res.status(201).json({
        message: 'Question created successfully!',
        question: newQuestion
    });

  } catch (error) {
    console.error('Error in newQuestionController:', error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

module.exports = { newQuestion };