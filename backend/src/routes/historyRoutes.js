const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const historyController = require("../controllers/historyController");

router.get(
    "/player",
    authMiddleware,
    historyController.getPlayerHistory
);

router.get(
    "/organizer",
    authMiddleware,
    historyController.getOrganizerHistory
);

router.get(
    "/organizer/:sessionId",
    authMiddleware,
    historyController.getOrganizerSessionById
);

module.exports = router;