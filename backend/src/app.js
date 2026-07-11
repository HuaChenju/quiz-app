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
        player => player.id === user.id
    );

    if (!exists) {
rooms[code].players.push(user);
    }

    socket.join(code);

    socket.roomCode = code;
    socket.userId = user.id;

    io.to(code).emit("players-update", rooms[code].players);

});

socket.on("start-game", () => {

    if (!socket.roomCode) {
        return;
    }

    rooms[socket.roomCode].started = true;
    rooms[socket.roomCode].currentQuestion = 0;


    io.to(socket.roomCode).emit("game-start", {
    quizId: rooms[socket.roomCode].quizId
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

    socket.on("disconnect", () => {

    if (socket.roomCode) {

        rooms[socket.roomCode].players =
            (rooms[socket.roomCode].players || []).filter(
                player => player.id !== socket.userId
            );

        io.to(socket.roomCode).emit(
            "players-update",
            rooms[socket.roomCode].players
        );

        if (rooms[socket.roomCode].players.length === 0) {
            delete rooms[socket.roomCode];
        }

    }

    console.log(`Client disconnected: ${socket.id}`);

});

});

const PORT = 5000;

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});