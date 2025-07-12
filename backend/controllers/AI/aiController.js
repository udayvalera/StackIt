const llm = require("../../Service/llm.js");
const { PrismaClient } = require("../../generated/prisma")

const prisma = new PrismaClient();

/**
 * @AI_response
 * @route POST /api/ai/:questionId
 * @queryparam {string} answerbyAI
 */
const generateAIResponse = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { answerbyAI } = req.query;

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "Question ID is required"
      });
    }

    // Mock data for testing when database is not available
    const mockQuestion = {
      id: questionId,
      title: "How to implement authentication in Node.js?",
      description: {
        text: "How to implement JWT authentication in React?"
      },
      tags: [
        { name: "nodejs" },
        { name: "authentication" },
        { name: "security" }
      ]
    };

    let question;
    try {
      // Try to fetch from database first
      question = await prisma.question.findUnique({
        where: { id: questionId },
        include: {
          tags: {
            select: { name: true }
          }
        }
      });
    } catch (dbError) {
      console.log("Database not available, using mock data");
      question = mockQuestion;
    }

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    const title = question.title;
    const description = JSON.stringify(question.description);
    const tags = question.tags.map(tag => tag.name);

    const aiResponse = await llm(title, description, tags);

    if (answerbyAI) {
      return res.status(201).json({
        success: true,
        message: "AI answer generated and saved successfully",
        data: {
          aiResponse: aiResponse
        }
      });
    }

    // Return just the AI response without saving
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