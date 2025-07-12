const { PrismaClient } = require('../../generated/prisma');

const prisma = new PrismaClient();

/**
 * Controller to get a paginated list of questions (feed).
 * Allows filtering by tags.
 *
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
const getQuestions = async (req, res) => {
  try {
    // --- 1. PAGINATION ---
    // Set default page and pageSize if not provided in the query string
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const skip = (page - 1) * pageSize;

    // --- 2. TAG FILTERING ---
    // Get tags from query string, expecting a comma-separated list
    const { tags } = req.query;
    let tagFilter = {};

    if (tags) {
      const tagList = tags.split(',').map(tag => tag.trim());
      // If tags are provided, construct the filter to find questions
      // that have at least one of the specified tags.
      tagFilter = {
        tags: {
          some: {
            name: {
              in: tagList,
            },
          },
        },
      };
    }

    // --- 3. DATABASE QUERY ---
    // Fetch a paginated and filtered list of questions
    const questions = await prisma.question.findMany({
      skip,
      take: pageSize,
      where: tagFilter,
      // Order by the most recently created questions
      orderBy: {
        createdAt: 'desc',
      },
      // Include related author and tag information
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
        // Use _count to get the number of related answers for each question
        _count: {
          select: { answers: true },
        },
      },
    });

    // Get the total count of questions that match the filter for pagination metadata
    const totalQuestions = await prisma.question.count({
      where: tagFilter,
    });

    // --- 4. FORMAT RESPONSE ---
    // Map over the questions to create the desired response structure
    const formattedQuestions = questions.map(question => ({
      id: question.id,
      title: question.title,
      description: question.description,
      createdAt: question.createdAt,
      author: question.author,
      tags: question.tags,
      // The count of answers is available in the _count property
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
  getQuestions
}