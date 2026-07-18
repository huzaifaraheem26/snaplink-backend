const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const urlRoutes = require("./routes/urlRoutes");

const app = express();

connectDB();

// If FRONTEND_URL is set, restrict CORS to it; otherwise allow all origins.
const corsOptions = process.env.FRONTEND_URL
    ? { origin: process.env.FRONTEND_URL }
    : {};

app.use(cors(corsOptions));
app.use(express.json());

// Health check / root
app.get("/", (req, res) => {
    res.send("URL Shortener Backend is Running...");
});

app.use("/api", urlRoutes);

const { redirectUrl } = require("./controllers/urlController");

// Short link redirect (keep last so it doesn't shadow /api or /)
app.get("/:shortCode", redirectUrl);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}`);
});
