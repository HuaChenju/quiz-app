
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

exports.deleteQuestion = async (req, res) => {
    try {

        const questionId = Number(req.params.id);

        const question = await prisma.question.findUnique({
            where: {
                id: questionId
            },
            include: {
                quiz: true
            }
        });

        if (!question) {
            return res.status(404).json({
                message: "Question not found"
            });
        }

        if (question.quiz.creatorId !== req.user.id) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        await prisma.answer.deleteMany({
            where: {
                questionId
            }
        });

        await prisma.question.delete({
            where: {
                id: questionId
            }
        });

        res.json({
            message: "Question deleted"
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.deleteQuiz = async (req, res) => {
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

        if (quiz.creatorId !== req.user.id) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        // Удаляем ответы всех вопросов
        for (const question of quiz.questions) {
            await prisma.answer.deleteMany({
                where: {
                    questionId: question.id
                }
            });
        }

        // Удаляем все вопросы квиза
        await prisma.question.deleteMany({
            where: {
                quizId
            }
        });

        // Удаляем сам квиз
        await prisma.quiz.delete({
            where: {
                id: quizId
            }
        });

        res.json({
            message: "Quiz deleted"
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.createRoom = async (req, res) => {
    try {
        const quizId = Number(req.params.id);

        const quiz = await prisma.quiz.findUnique({
            where: {
                id: quizId
            }
        });

        if (!quiz) {
            return res.status(404).json({
                message: "Quiz not found"
            });
        }

        if (quiz.creatorId !== req.user.id) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const code = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

        const room = await prisma.room.create({
            data: {
                code,
                quizId
            }
        });

        const rooms = req.app.get("rooms");

        rooms[code] = {
            players: [],
            quizId,
            ownerId: req.user.id,
            started: false,
                currentQuestion: 0

        };

        res.json(room);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
};