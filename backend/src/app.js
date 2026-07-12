require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Quiz server works"
    });
});

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
    },
});

const rooms = {};

app.set("io", io);
app.set("rooms", rooms);

io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("join-room", ({ code, user }) => {
        if (!rooms[code]) {
            socket.emit("room-not-found");
            return;
        }

        const exists = rooms[code].players.find(
            (player) => player.id === user.id
        );

        if (!exists) {
            rooms[code].players.push(user);
        }

        socket.join(code);

        socket.roomCode = code;
        socket.userId = user.id;

        io.to(code).emit(
            "players-update",
            rooms[code].players
        );
    });

    socket.on("start-game", () => {
        if (!socket.roomCode) {
            socket.emit(
                "start-denied",
                "Вы не подключены к комнате"
            );
            return;
        }

        const room = rooms[socket.roomCode];

        if (!room) {
            socket.emit(
                "start-denied",
                "Комната не найдена"
            );
            return;
        }

        if (room.ownerId !== socket.userId) {
            socket.emit(
                "start-denied",
                "Запустить квиз может только организатор"
            );
            return;
        }

        if (room.started) {
            return;
        }

        room.started = true;
        room.currentQuestion = 0;

        io.to(socket.roomCode).emit("game-start", {
            quizId: room.quizId
        });
    });

    socket.on("next-question", () => {
        if (!socket.roomCode) {
            return;
        }

        const room = rooms[socket.roomCode];

        if (!room) {
            return;
        }

        if (room.ownerId !== socket.userId) {
            return;
        }

        room.currentQuestion++;

        io.to(socket.roomCode).emit(
            "question-changed",
            {
                currentQuestion: room.currentQuestion
            }
        );
    });


    socket.on("submit-result", ({ score, totalQuestions }) => {
        if (!socket.roomCode || !socket.userId) {
            socket.emit(
                "result-error",
                "Вы не подключены к комнате"
            );
            return;
        }

        const room = rooms[socket.roomCode];

        if (!room) {
            socket.emit(
                "result-error",
                "Комната не найдена"
            );
            return;
        }

        const player = room.players.find(
            (currentPlayer) =>
                currentPlayer.id === socket.userId
        );

        if (!player) {
            socket.emit(
                "result-error",
                "Участник не найден"
            );
            return;
        }

        if (!room.results) {
            room.results = {};
        }

        room.results[socket.userId] = {
            userId: socket.userId,
            name: player.name,
            score: Number(score) || 0,
            totalQuestions: Number(totalQuestions) || 0
        };

        const leaderboard = Object.values(room.results)
            .sort((firstPlayer, secondPlayer) => {
                if (secondPlayer.score !== firstPlayer.score) {
                    return secondPlayer.score - firstPlayer.score;
                }

                return firstPlayer.name.localeCompare(
                    secondPlayer.name
                );
            })
            .map((result, index) => ({
                ...result,
                place: index + 1
            }));

        socket.emit("result-submitted", {
            leaderboard,
            submittedPlayers: leaderboard.length,
            totalPlayers: room.players.length
        });

        if (
            leaderboard.length >= room.players.length
        ) {
            io.to(socket.roomCode).emit(
                "leaderboard-ready",
                leaderboard
            );
        }
    });

    socket.on("get-leaderboard", () => {
        if (!socket.roomCode) {
            return;
        }

        const room = rooms[socket.roomCode];

        if (!room || !room.results) {
            return;
        }

        const leaderboard = Object.values(room.results)
            .sort((firstPlayer, secondPlayer) => {
                if (secondPlayer.score !== firstPlayer.score) {
                    return secondPlayer.score - firstPlayer.score;
                }

                return firstPlayer.name.localeCompare(
                    secondPlayer.name
                );
            })
            .map((result, index) => ({
                ...result,
                place: index + 1
            }));

        socket.emit("leaderboard-ready", leaderboard);
    });

    socket.on("disconnect", () => {
        if (socket.roomCode) {
            const room = rooms[socket.roomCode];

            if (room) {
                room.players = (room.players || []).filter(
                    (player) => player.id !== socket.userId
                );

                io.to(socket.roomCode).emit(
                    "players-update",
                    room.players
                );

                if (room.players.length === 0) {
                    delete rooms[socket.roomCode];
                }
            }
        }

        console.log(`Client disconnected: ${socket.id}`);
    });
});

const PORT = 5000;

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});