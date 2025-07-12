const { PrismaClient } =  require('../../generated/prisma');

const prisma = new PrismaClient();

/**
 *  to get a single question by its ID.
 * The response is tailored based on whether the request is from an
 * authenticated user or a guest.
 *
 * - For authenticated users, it includes their interaction (upvote/downvote) with each answer.
 * - For guests, it provides public question and answer data without user-specific interactions.
 *
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
const getQuestionById = async (req, res) => {
  try {
    const { id: questionId } = req.params;
    // The user ID is expected to be on req.user if an auth middleware is used.
    // If it doesn't exist, the request is treated as from a guest.
    const userId = req.user?.id;

    // --- 1. FETCH THE QUESTION AND ITS RELATED DATA ---
    const question = await prisma.question.findUnique({
      where: {
        id: questionId,
      },
      include: {
        // Include author and tag details
        author: {
          select: { id: true, username: true },
        },
        tags: {
          select: { id: true, name: true },
        },
        // Include all answers with their authors, comments, and vote counts
        answers: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            author: {
              select: { id: true, username: true },
            },
            // Include comments for each answer, along with the comment author
            comments: {
              orderBy: {
                createdAt: 'asc',
              },
              include: {
                author: {
                  select: { id: true, username: true },
                },
              },
            },
            // Get the counts of upvotes and downvotes for each answer
            _count: {
              select: {
                upvotedBy: true,
                downvotedBy: true,
              },
            },
          },
        },
      },
    });

    // If no question is found, return a 404 error
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.',
      });
    }

    // --- 2. TAILOR THE RESPONSE BASED ON AUTHENTICATION ---
    let formattedAnswers;

    if (userId) {
      // --- AUTHENTICATED USER FLOW ---
      // Fetch the user's voting records to determine their interaction
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { upvotedAnswerIds: true, downvotedAnswerIds: true },
      });

      formattedAnswers = question.answers.map(answer => {
        let userInteraction = null;
        if (user.upvotedAnswerIds.includes(answer.id)) {
          userInteraction = 'upvoted';
        } else if (user.downvotedAnswerIds.includes(answer.id)) {
          userInteraction = 'downvoted';
        }

        return {
          id: answer.id,
          content: answer.content,
          createdAt: answer.createdAt,
          author: answer.author,
          comments: answer.comments,
          upvoteCount: answer._count.upvotedBy,
          downvoteCount: answer._count.downvotedBy,
          userInteraction, // Add the user-specific interaction
        };
      });
    } else {
      // --- GUEST USER FLOW ---
      // Format answers without user-specific interaction data
      formattedAnswers = question.answers.map(answer => ({
        id: answer.id,
        content: answer.content,
        createdAt: answer.createdAt,
        author: answer.author,
        comments: answer.comments,
        upvoteCount: answer._count.upvotedBy,
        downvoteCount: answer._count.downvotedBy,
        userInteraction: null, // Always null for guests
      }));
    }

    // --- 3. CONSTRUCT AND SEND THE FINAL RESPONSE ---
    const responseData = {
      id: question.id,
      title: question.title,
      description: question.description,
      createdAt: question.createdAt,
      author: question.author,
      tags: question.tags,
      answers: formattedAnswers,
    };

    res.status(200).json({
      success: true,
      message: 'Question retrieved successfully.',
      data: responseData,
    });
  } catch (error) {
    console.error('Error fetching question by ID:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the question.',
      error: error.message,
    });
  }
};

module.exports =  {getQuestionById};
