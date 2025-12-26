const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from frontend folder
app.use("/frontend", express.static(path.join(__dirname, "../frontend")));

// Redirect root to index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/html/index.html"));
});

app.use("/auth", require("./routes/auth"));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
