const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

/**
 * Controller to get a paginated list of questions (feed).
 * Allows filtering by tags and sorting by different criteria.
 *
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
const getQuestions = async (req, res) => {
  try {
    // --- 1. PAGINATION & FILTER PARAMETERS ---
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const skip = (page - 1) * pageSize;

    // Get filter, and tags from the query string
    const { filter, tags } = req.query;

    // --- 2. BUILD DATABASE QUERY CONDITIONS ---
    let whereClause = {};
    let orderByClause = {};

    // -- Tag Filtering --
    if (tags) {
      const tagList = tags.split(',').map(tag => tag.trim());
      whereClause.tags = {
        some: {
          name: {
            in: tagList,
          },
        },
      };
    }

    // -- Sorting and Filtering Logic --
    // A note on "Most Voted": Your current schema tracks votes on Answers, not Questions.
    // To sort questions by votes, you would need to aggregate votes from all answers per question,
    // which is complex for a simple query. A better approach is to add a 'voteScore' field
    // to your Question model. For now, 'most_answered' is a great proxy for popular questions.
    switch (filter) {
      case 'most_answered':
        orderByClause = {
          answers: {
            _count: 'desc',
          },
        };
        break;

      case 'unanswered':
        whereClause.answers = {
          none: {},
        };
        orderByClause = {
            createdAt: 'desc', // Show newest unanswered questions first
        };
        break;

      case 'newest':
      default:
        // Default to sorting by the most recently created questions
        orderByClause = {
          createdAt: 'desc',
        };
        break;
    }

    // --- 3. DATABASE QUERY ---
    // Fetch a paginated and filtered list of questions
    const questions = await prisma.question.findMany({
      skip,
      take: pageSize,
      where: whereClause,
      orderBy: orderByClause,
      // Include related author, tags, and answer count
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { answers: true },
        },
      },
    });

    // Get the total count of questions that match the filter for pagination
    const totalQuestions = await prisma.question.count({
      where: whereClause,
    });

    // --- 4. FORMAT RESPONSE ---
    const formattedQuestions = questions.map(question => ({
      id: question.id,
      title: question.title,
      description: question.description,
      createdAt: question.createdAt,
      author: question.author,
      tags: question.tags,
      answerCount: question._count.answers,
    }));

    // --- 5. SEND RESPONSE ---
    res.status(200).json({
      success: true,
      message: 'Questions retrieved successfully.',
      data: {
        questions: formattedQuestions,
        pagination: {
          total: totalQuestions,
          page,
          pageSize,
          totalPages: Math.ceil(totalQuestions / pageSize),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching questions.',
      error: error.message,
    });
  }
};

module.exports = {
  getQuestions,
};