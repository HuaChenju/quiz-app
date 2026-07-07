require("dotenv").config();

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");


const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Quiz server works" });
});


const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});