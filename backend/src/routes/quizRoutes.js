const express = require("express");
const router = express.Router();

const {
    createQuiz,
    getMyQuizzes,
    addQuestion,
    getQuizById,
    updateQuestion,
    deleteQuestion,
    deleteQuiz,
    createRoom,
} = require("../controllers/quizController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post(
    "/",
    authMiddleware,
    roleMiddleware("ORGANIZER"),
    createQuiz
);

router.get(
    "/my",
    authMiddleware,
    roleMiddleware("ORGANIZER"),
    getMyQuizzes
);

router.post(
    "/:id/questions",
    authMiddleware,
    roleMiddleware("ORGANIZER"),
    addQuestion
);

router.get(
    "/:id",
    authMiddleware,
    getQuizById
);

router.put(
    "/questions/:id",
    authMiddleware,
    roleMiddleware("ORGANIZER"),
    updateQuestion
);

router.delete(
    "/questions/:id",
    authMiddleware,
    roleMiddleware("ORGANIZER"),
    deleteQuestion
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("ORGANIZER"),
    deleteQuiz
);

router.post(
    "/:id/room",
    authMiddleware,
    roleMiddleware("ORGANIZER"),
    createRoom
);

module.exports = router;