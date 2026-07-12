const prisma = require("../config/prisma");

const allowedQuestionTypes = ["single", "multiple"];

const getQuizOwner = async (quizId) => {
    return prisma.quiz.findUnique({
        where: {
            id: quizId
        },
        select: {
            id: true,
            creatorId: true
        }
    });
};

exports.createQuiz = async (req, res) => {
    try {
        const {
            title,
            category,
            rules,
            timePerQuestion
        } = req.body;

        const normalizedTitle = title?.trim();
        const normalizedCategory = category?.trim();
        const normalizedRules = rules?.trim() || "";
        const normalizedTime = Number(timePerQuestion);

        if (!normalizedTitle) {
            return res.status(400).json({
                message: "Введите название квиза"
            });
        }

        if (!normalizedCategory) {
            return res.status(400).json({
                message: "Введите категорию квиза"
            });
        }

        if (
            !Number.isInteger(normalizedTime) ||
            normalizedTime < 5 ||
            normalizedTime > 300
        ) {
            return res.status(400).json({
                message: "Время на вопрос должно быть от 5 до 300 секунд"
            });
        }

        const quiz = await prisma.quiz.create({
            data: {
                title: normalizedTitle,
                category: normalizedCategory,
                rules: normalizedRules,
                timePerQuestion: normalizedTime,
                creatorId: req.user.id
            }
        });

        return res.status(201).json(quiz);
    } catch (error) {
        return res.status(500).json({
            message: "Не удалось создать квиз",
            error: error.message
        });
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
            },
            orderBy: {
                id: "desc"
            }
        });

        return res.json(quizzes);
    } catch (error) {
        return res.status(500).json({
            message: "Не удалось загрузить квизы",
            error: error.message
        });
    }
};

exports.addQuestion = async (req, res) => {
    try {
        const quizId = Number(req.params.id);
        const {
            text,
            type,
            answers
        } = req.body;

        if (!Number.isInteger(quizId)) {
            return res.status(400).json({
                message: "Некорректный ID квиза"
            });
        }

        const quiz = await getQuizOwner(quizId);

        if (!quiz) {
            return res.status(404).json({
                message: "Квиз не найден"
            });
        }

        if (quiz.creatorId !== req.user.id) {
            return res.status(403).json({
                message: "Нельзя добавлять вопросы в чужой квиз"
            });
        }

        const normalizedText = text?.trim();

        if (!normalizedText) {
            return res.status(400).json({
                message: "Введите текст вопроса"
            });
        }

        if (!allowedQuestionTypes.includes(type)) {
            return res.status(400).json({
                message: "Некорректный тип вопроса"
            });
        }

        if (!Array.isArray(answers) || answers.length < 2) {
            return res.status(400).json({
                message: "Добавьте минимум два варианта ответа"
            });
        }

        const normalizedAnswers = answers.map((answer) => ({
            text: answer.text?.trim(),
            isCorrect: Boolean(answer.isCorrect)
        }));

        const hasEmptyAnswer = normalizedAnswers.some(
            (answer) => !answer.text
        );

        if (hasEmptyAnswer) {
            return res.status(400).json({
                message: "Заполните все варианты ответа"
            });
        }

        const correctAnswersCount = normalizedAnswers.filter(
            (answer) => answer.isCorrect
        ).length;

        if (correctAnswersCount === 0) {
            return res.status(400).json({
                message: "Выберите хотя бы один правильный ответ"
            });
        }

        if (type === "single" && correctAnswersCount !== 1) {
            return res.status(400).json({
                message: "Для одиночного выбора должен быть один правильный ответ"
            });
        }

        if (type === "multiple" && correctAnswersCount < 2) {
            return res.status(400).json({
                message: "Для множественного выбора выберите минимум два правильных ответа"
            });
        }

        const question = await prisma.question.create({
            data: {
                text: normalizedText,
                type,
                quizId,
                answers: {
                    create: normalizedAnswers
                }
            },
            include: {
                answers: true
            }
        });

        return res.status(201).json(question);
    } catch (error) {
        return res.status(500).json({
            message: "Не удалось добавить вопрос",
            error: error.message
        });
    }
};

exports.getQuizById = async (req, res) => {
    try {
        const quizId = Number(req.params.id);

        if (!Number.isInteger(quizId)) {
            return res.status(400).json({
                message: "Некорректный ID квиза"
            });
        }

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
                message: "Квиз не найден"
            });
        }

        return res.json(quiz);
    } catch (error) {
        return res.status(500).json({
            message: "Не удалось загрузить квиз",
            error: error.message
        });
    }
};

exports.updateQuestion = async (req, res) => {
    try {
        const questionId = Number(req.params.id);
        const {
            text,
            type,
            answers
        } = req.body;

        if (!Number.isInteger(questionId)) {
            return res.status(400).json({
                message: "Некорректный ID вопроса"
            });
        }

        const existingQuestion = await prisma.question.findUnique({
            where: {
                id: questionId
            },
            include: {
                quiz: true
            }
        });

        if (!existingQuestion) {
            return res.status(404).json({
                message: "Вопрос не найден"
            });
        }

        if (existingQuestion.quiz.creatorId !== req.user.id) {
            return res.status(403).json({
                message: "Нельзя изменять чужой вопрос"
            });
        }

        const normalizedText = text?.trim();
        const normalizedType = type || existingQuestion.type;

        if (!normalizedText) {
            return res.status(400).json({
                message: "Введите текст вопроса"
            });
        }

        if (!allowedQuestionTypes.includes(normalizedType)) {
            return res.status(400).json({
                message: "Некорректный тип вопроса"
            });
        }

        if (!Array.isArray(answers) || answers.length < 2) {
            return res.status(400).json({
                message: "Добавьте минимум два варианта ответа"
            });
        }

        const normalizedAnswers = answers.map((answer) => ({
            text: answer.text?.trim(),
            isCorrect: Boolean(answer.isCorrect)
        }));

        if (normalizedAnswers.some((answer) => !answer.text)) {
            return res.status(400).json({
                message: "Заполните все варианты ответа"
            });
        }

        const correctAnswersCount = normalizedAnswers.filter(
            (answer) => answer.isCorrect
        ).length;

        if (correctAnswersCount === 0) {
            return res.status(400).json({
                message: "Выберите хотя бы один правильный ответ"
            });
        }

        if (
            normalizedType === "single" &&
            correctAnswersCount !== 1
        ) {
            return res.status(400).json({
                message: "Для одиночного выбора должен быть один правильный ответ"
            });
        }

        if (
            normalizedType === "multiple" &&
            correctAnswersCount < 2
        ) {
            return res.status(400).json({
                message: "Для множественного выбора выберите минимум два правильных ответа"
            });
        }

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
                text: normalizedText,
                type: normalizedType,
                answers: {
                    create: normalizedAnswers
                }
            },
            include: {
                answers: true
            }
        });

        return res.json(question);
    } catch (error) {
        return res.status(500).json({
            message: "Не удалось изменить вопрос",
            error: error.message
        });
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        const questionId = Number(req.params.id);

        if (!Number.isInteger(questionId)) {
            return res.status(400).json({
                message: "Некорректный ID вопроса"
            });
        }

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
                message: "Вопрос не найден"
            });
        }

        if (question.quiz.creatorId !== req.user.id) {
            return res.status(403).json({
                message: "Нельзя удалять чужой вопрос"
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

        return res.json({
            message: "Вопрос удалён"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Не удалось удалить вопрос",
            error: error.message
        });
    }
};

exports.deleteQuiz = async (req, res) => {
    try {
        const quizId = Number(req.params.id);

        if (!Number.isInteger(quizId)) {
            return res.status(400).json({
                message: "Некорректный ID квиза"
            });
        }

        const quiz = await prisma.quiz.findUnique({
            where: {
                id: quizId
            },
            include: {
                questions: true
            }
        });

        if (!quiz) {
            return res.status(404).json({
                message: "Квиз не найден"
            });
        }

        if (quiz.creatorId !== req.user.id) {
            return res.status(403).json({
                message: "Нельзя удалять чужой квиз"
            });
        }

        const questionIds = quiz.questions.map(
            (question) => question.id
        );

        if (questionIds.length > 0) {
            await prisma.answer.deleteMany({
                where: {
                    questionId: {
                        in: questionIds
                    }
                }
            });
        }

        await prisma.question.deleteMany({
            where: {
                quizId
            }
        });

        await prisma.room.deleteMany({
            where: {
                quizId
            }
        });

        await prisma.quiz.delete({
            where: {
                id: quizId
            }
        });

        return res.json({
            message: "Квиз удалён"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Не удалось удалить квиз",
            error: error.message
        });
    }
};

exports.createRoom = async (req, res) => {
    try {
        const quizId = Number(req.params.id);

        if (!Number.isInteger(quizId)) {
            return res.status(400).json({
                message: "Некорректный ID квиза"
            });
        }

        const quiz = await prisma.quiz.findUnique({
            where: {
                id: quizId
            },
            include: {
                questions: true
            }
        });

        if (!quiz) {
            return res.status(404).json({
                message: "Квиз не найден"
            });
        }

        if (quiz.creatorId !== req.user.id) {
            return res.status(403).json({
                message: "Нельзя запускать чужой квиз"
            });
        }

        if (quiz.questions.length === 0) {
            return res.status(400).json({
                message: "Добавьте хотя бы один вопрос перед запуском"
            });
        }

        let code;
        let existingRoom;

        do {
            code = Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase();

            existingRoom = await prisma.room.findUnique({
                where: {
                    code
                }
            });
        } while (existingRoom);

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

        return res.status(201).json(room);
    } catch (error) {
        return res.status(500).json({
            message: "Не удалось создать комнату",
            error: error.message
        });
    }
};