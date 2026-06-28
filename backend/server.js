const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.json({
        message: "Quiz server works"
    });
});


app.listen(8080, () => {
    console.log("Server started on port 8080");
});