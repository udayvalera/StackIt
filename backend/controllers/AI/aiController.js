const llm = require("../../Service/llm.js");
const { PrismaClient } = require("../../generated/prisma")

const prisma = new PrismaClient();

/**
 * @AI_response
 * @route POST /api/ai/generate
 * @body {string} questionId - The question ID to generate AI response for
 * @queryparams {boolean} answerbyAI - set to true if you want ai to answer your question
 */ 
const generateAIResponse = async (req, res) => {
  try {
    const { questionId } = req.body;
    const { answerbyAI } = req.query;

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "Question ID is required"
      });
    }

    if (answerbyAI !== "true") {
        return res.status(400).json({
            success: false,
            message: "answerbyAI parameter is required"
        });
    }

    // Fetch question data from database
    let question;
    try {
      question = await prisma.question.findUnique({
        where: { id: questionId },
        include: {
          tags: {
            select: { name: true }
          }
        }
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return res.status(500).json({
        success: false,
        message: "Database connection error"
      });
    }

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    // Extract data from the question
    const title = question.title;
    const description = JSON.stringify(question.description);
    const tags = question.tags.map(tag => tag.name);

    // Generate AI response
    const aiResponse = await llm(title, description, tags);

    // Return the AI response
    return res.status(200).json({
      success: true,
      message: "AI response generated successfully",
      data: {
        questionId: questionId,
        questionTitle: title,
        aiResponse: aiResponse
      }
    });

  } catch (error) {
    console.error("Error in generateAIResponse:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

module.exports = {
  generateAIResponse
};