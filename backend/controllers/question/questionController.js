const { newQuestion } = require('./newQuestionController');
const { getQuestions } = require('./getQuestionsController')
const { getQuestionById } = require('./getQuestionByIdController');


module.exports = {
    newQuestion,
    getQuestions,
    getQuestionById
}