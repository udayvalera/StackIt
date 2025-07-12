const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

/**
 * Controller to handle voting (upvote/downvote) on an answer.
 * This operation is restricted to authenticated users.
 * It manages adding, removing, and switching votes within a transaction.
 *
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
const voteAnswer = async (req, res) => {
  // --- 1. AUTHENTICATION CHECK ---
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. You must be logged in to vote.',
    });
  }

  try {
    // --- 2. INPUT VALIDATION ---
    const { answerId } = req.params;
    const { voteType } = req.body; // Expected values: 'upvote' or 'downvote'

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vote type. Must be 'upvote' or 'downvote'.",
      });
    }

    // --- 3. TRANSACTIONAL VOTE LOGIC ---
    // A transaction ensures that reading the user's state and updating it
    // happens atomically, preventing race conditions.
    const result = await prisma.$transaction(async (tx) => {
      // Fetch the user's current voting record for this answer
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { upvotedAnswerIds: true, downvotedAnswerIds: true },
      });

      if (!user) {
        // This case should ideally not be hit if auth middleware is working
        throw new Error('User not found.');
      }
      
      // Check if the answer exists
      const answer = await tx.answer.findUnique({
        where: { id: answerId },
        select: { id: true }
      });

      if (!answer) {
          throw new Error('Answer not found.');
      }

      const isCurrentlyUpvoted = user.upvotedAnswerIds.includes(answerId);
      const isCurrentlyDownvoted = user.downvotedAnswerIds.includes(answerId);

      let newUpvotedIds = [...user.upvotedAnswerIds];
      let newDownvotedIds = [...user.downvotedAnswerIds];
      let voteStatus;

      if (voteType === 'upvote') {
        if (isCurrentlyUpvoted) {
          // --- Case 1: User retracts an upvote ---
          newUpvotedIds = newUpvotedIds.filter((id) => id !== answerId);
          voteStatus = 'none';
        } else {
          // --- Case 2: User casts a new upvote (or switches from downvote) ---
          newUpvotedIds.push(answerId);
          // If it was downvoted, remove the downvote
          newDownvotedIds = newDownvotedIds.filter((id) => id !== answerId);
          voteStatus = 'upvoted';
        }
      } else { // voteType === 'downvote'
        if (isCurrentlyDownvoted) {
          // --- Case 3: User retracts a downvote ---
          newDownvotedIds = newDownvotedIds.filter((id) => id !== answerId);
          voteStatus = 'none';
        } else {
          // --- Case 4: User casts a new downvote (or switches from upvote) ---
          newDownvotedIds.push(answerId);
          // If it was upvoted, remove the upvote
          newUpvotedIds = newUpvotedIds.filter((id) => id !== answerId);
          voteStatus = 'downvoted';
        }
      }

      // Update the user's vote arrays
      await tx.user.update({
        where: { id: userId },
        data: {
          upvotedAnswerIds: newUpvotedIds,
          downvotedAnswerIds: newDownvotedIds,
        },
      });
      
      return { voteStatus };
    });

    // --- 4. SEND SUCCESS RESPONSE ---
    res.status(200).json({
      success: true,
      message: `Vote successfully recorded. New status: ${result.voteStatus}.`,
      data: {
        voteStatus: result.voteStatus,
      },
    });
  } catch (error) {
    console.error('Error processing vote:', error);
    
    // Custom error message for not found answer
    if (error.message === 'Answer not found.') {
        return res.status(404).json({
            success: false,
            message: 'Answer not found.',
        });
    }

    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your vote.',
      error: error.message,
    });
  }
};

module.exports = {
  voteAnswer
};
