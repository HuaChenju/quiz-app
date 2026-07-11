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
    createRoom

} = require("../controllers/quizController");
const authMiddleware = require("../middleware/authMiddleware");



router.post("/", authMiddleware, createQuiz);
router.post("/:id/questions", authMiddleware, addQuestion);
router.get("/my", authMiddleware, getMyQuizzes);
router.get("/:id", authMiddleware, getQuizById);
router.put(
    "/questions/:id",
    authMiddleware,
    updateQuestion
);
router.delete(
    "/questions/:id",
    authMiddleware,
    deleteQuestion
);

router.delete(
    "/:id",
    authMiddleware,
    deleteQuiz
);

router.post(
    "/:id/room",
    authMiddleware,
    createRoom
);

module.exports = router;