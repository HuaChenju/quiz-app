const prisma = require("../config/prisma");

exports.getPlayerHistory = async (req, res) => {
    try {
        const history = await prisma.sessionResult.findMany({
            where: {
                userId: req.user.id
            },
            include: {
                session: {
                    include: {
                        quiz: {
                            select: {
                                title: true,
                                category: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        const result = history.map((item) => ({
            sessionId: item.session.id,
            quizTitle: item.session.quiz.title,
            category: item.session.quiz.category,
            finishedAt: item.session.finishedAt,
            score: item.score,
            totalQuestions: item.totalQuestions,
            place: item.place
        }));

        return res.json(result);
    } catch (error) {
        return res.status(500).json({
            message: "Не удалось загрузить историю",
            error: error.message
        });
    }
};

exports.getOrganizerHistory = async (req, res) => {
    try {
        const sessions = await prisma.quizSession.findMany({
            where: {
                organizerId: req.user.id
            },
            include: {
                quiz: {
                    select: {
                        title: true,
                        category: true
                    }
                },
                results: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    },
                    orderBy: {
                        place: "asc"
                    }
                }
            },
            orderBy: {
                startedAt: "desc"
            }
        });

        const result = sessions.map((session) => ({
            sessionId: session.id,
            quizTitle: session.quiz.title,
            category: session.quiz.category,
            roomCode: session.roomCode,
            finishedAt: session.finishedAt,
            participants: session.results.length,
            winner:
                session.results.length > 0
                    ? session.results[0].user.name
                    : null,
            results: session.results.map((result) => ({
                userId: result.user.id,
                name: result.user.name,
                score: result.score,
                totalQuestions: result.totalQuestions,
                place: result.place
            }))
        }));

        return res.json(result);
    } catch (error) {
        return res.status(500).json({
            message: "Не удалось загрузить историю",
            error: error.message
        });
    }
};

exports.getOrganizerSessionById = async (req, res) => {
    try {
        const sessionId = Number(req.params.sessionId);

        if (!Number.isInteger(sessionId)) {
            return res.status(400).json({
                message: "Некорректный ID сессии"
            });
        }

        const session = await prisma.quizSession.findFirst({
            where: {
                id: sessionId,
                organizerId: req.user.id
            },
            include: {
                quiz: {
                    select: {
                        title: true,
                        category: true
                    }
                },
                results: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    },
                    orderBy: [
                        {
                            place: "asc"
                        },
                        {
                            score: "desc"
                        }
                    ]
                }
            }
        });

        if (!session) {
            return res.status(404).json({
                message: "Сессия не найдена"
            });
        }

        return res.json({
            sessionId: session.id,
            quizTitle: session.quiz.title,
            category: session.quiz.category,
            roomCode: session.roomCode,
            status: session.status,
            startedAt: session.startedAt,
            finishedAt: session.finishedAt,
            participants: session.results.length,
            results: session.results.map((result) => ({
                userId: result.user.id,
                name: result.user.name,
                score: result.score,
                totalQuestions: result.totalQuestions,
                place: result.place
            }))
        });
    } catch (error) {
        return res.status(500).json({
            message: "Не удалось загрузить результаты сессии",
            error: error.message
        });
    }
};