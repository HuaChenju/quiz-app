
const prisma = require("../config/prisma");

exports.createQuiz = async (req, res) => {
    try {
        const { title, category, rules, timePerQuestion } = req.body;

        const quiz = await prisma.quiz.create({
            data: {
                title,
                category,
                rules,
                timePerQuestion,
                creatorId: req.user.id
            }
        });

        res.json(quiz);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getMyQuizzes = async (req, res) => {
    try {
        const quizzes = await prisma.quiz.findMany({
            where: {
                creatorId: req.user.id
            },
            include: {
                questions: true
            }
        });

        res.json(quizzes);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

exports.addQuestion = async (req, res) => {
    try {
        const { text, type, answers } = req.body;
        const quizId = Number(req.params.id);

        const question = await prisma.question.create({
            data: {
                text,
                type,
                quizId,
                answers: {
                    create: answers
                }
            },
            include: {
                answers: true
            }
        });

        res.json(question);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

exports.getQuizById = async (req, res) => {
    try {
        const quizId = Number(req.params.id);

        const quiz = await prisma.quiz.findUnique({
            where: {
                id: quizId
            },
            include: {
                questions: {
                    include: {
                        answers: true
                    }
                }
            }
        });

        if (!quiz) {
            return res.status(404).json({
                message: "Quiz not found"
            });
        }

        res.json(quiz);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

exports.updateQuestion = async (req, res) => {

    try {

        const questionId = Number(req.params.id);

        const {
            text,
            answers
        } = req.body;



        await prisma.answer.deleteMany({
            where: {
                questionId
            }
        });



        const question = await prisma.question.update({

            where: {
                id: questionId
            },


            data: {

                text,

                answers: {
                    create: answers
                }

            },


            include: {
                answers: true
            }

        });



        res.json(question);


    } catch(error) {

        res.status(500).json({
            error: error.message
        });

    }

};