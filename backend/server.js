const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cors());

// Serve static files from frontend folder
app.use("/frontend", express.static(path.join(__dirname, "../frontend")));

// Redirect root to index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/html/index.html"));
});

app.use("/auth", require("./routes/auth"));
app.use("/applications", require("./routes/applications"));
app.use("/api/monthlyshare", require("./routes/monthlyShare"));
app.use("/api/savings", require("./routes/savingsAccount"));
app.use("/api/investment-requests", require("./routes/investmentRequest"));
app.use("/api/investment-accounts", require("./routes/investmentAccount"));
app.use("/api/investment-recovery", require("./routes/investmentRecovery"));
app.use("/api/interest-rates", require("./routes/interestRate"));
app.use("/api/expenditure", require("./routes/expenditure"));
app.use("/api/income", require("./routes/income"));
app.use("/api/fixed-deposit", require("./routes/fixedDeposit"));
app.use("/api/fdr-rates",      require("./routes/fdrRates"));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
