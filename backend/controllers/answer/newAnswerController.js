const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

/**
 * Controller to create a new answer for a given question.
 * This operation is restricted to authenticated users only.
 *
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
const newAnswer = async (req, res) => {
  // --- 1. AUTHENTICATION CHECK ---
  // This controller assumes an authentication middleware has already run and
  // attached the user's information to `req.user`.
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. You must be logged in to post an answer.',
    });
  }

  try {
    // --- 2. INPUT VALIDATION ---
    const { questionId } = req.params;
    const { content } = req.body;

    // Ensure that the answer content is not empty.
    // The 'content' field is of type Json, so we expect a JSON object.
    if (!content || Object.keys(content).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Answer content cannot be empty.',
      });
    }

    // --- 3. VERIFY QUESTION EXISTENCE ---
    // Before creating an answer, check if the target question actually exists.
    const questionExists = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true }, // Select only 'id' for an efficient existence check
    });

    if (!questionExists) {
      return res.status(404).json({
        success: false,
        message: 'Question not found. Cannot post an answer to a non-existent question.',
      });
    }

    // --- 4. CREATE THE NEW ANSWER ---
    // If the user is authenticated and the question exists, create the answer.
    const newAnswer = await prisma.answer.create({
      data: {
        content,
        // Connect the answer to the author (the authenticated user)
        author: {
          connect: { id: userId },
        },
        // Connect the answer to the specified question
        question: {
          connect: { id: questionId },
        },
      },
      // Include author details in the response for immediate use by the client
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    // --- 5. SEND SUCCESS RESPONSE ---
    // Respond with a 201 status code for successful resource creation.
    res.status(201).json({
      success: true,
      message: 'Answer posted successfully.',
      data: newAnswer,
    });
  } catch (error) {
    console.error('Error creating new answer:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while posting the answer.',
      error: error.message,
    });
  }
};

module.exports =  {
    newAnswer
};