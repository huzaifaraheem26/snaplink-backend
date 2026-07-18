const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const QRCode = require("qrcode");
const { nanoid } = require("nanoid");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// DATABASE CONNECTION
// ============================================
const mongoose = require("mongoose");

// MongoDB Schema
const UrlSchema = new mongoose.Schema({
    originalUrl: {
        type: String,
        required: true
    },
    shortCode: {
        type: String,
        required: true,
        unique: true
    },
    shortUrl: {
        type: String,
        required: true
    },
    qrCode: {
        type: String
    },
    clicks: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Url = mongoose.model("Url", UrlSchema);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
});

// ============================================
// CORS CONFIGURATION
// ============================================
const corsOptions = process.env.FRONTEND_URL
    ? {
        origin: [
            process.env.FRONTEND_URL,
            "http://localhost:5500",
            "http://127.0.0.1:5500"
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    }
    : {
        origin: "*",
        credentials: true
    };

app.use(cors(corsOptions));
app.use(express.json());

// ============================================
// HEALTH CHECK
// ============================================
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "SnapLink API is running!",
        endpoints: {
            "/": "Health check",
            "/api/shorten": "POST - Shorten URL",
            "/api/links": "GET - Get all links",
            "/api/links/:id": "DELETE - Delete link",
            "/:shortCode": "GET - Redirect to original URL"
        }
    });
});

// ============================================
// API ROUTES
// ============================================

// POST /api/shorten - Shorten URL
app.post("/api/shorten", async (req, res) => {
    try {
        const { originalUrl } = req.body;

        if (!originalUrl) {
            return res.status(400).json({
                success: false,
                message: "URL is required"
            });
        }

        // Validate URL
        try {
            new URL(originalUrl);
        } catch {
            return res.status(400).json({
                success: false,
                message: "Invalid URL format. Include http:// or https://"
            });
        }

        // Generate short code (4 characters - short!)
        const shortCode = nanoid(4);
        
        // Base URL (custom domain or Render)
        const BASE_URL = process.env.BASE_URL || "https://snaplink-backend-1.onrender.com";
        const shortUrl = `${BASE_URL}/${shortCode}`;

        // Generate QR Code
        const qrCode = await QRCode.toDataURL(shortUrl);

        // Save to database
        const newUrl = new Url({
            originalUrl,
            shortCode,
            shortUrl,
            qrCode,
            clicks: 0
        });

        await newUrl.save();

        res.json({
            success: true,
            shortUrl: shortUrl,
            shortCode: shortCode,
            qrCode: qrCode,
            data: {
                id: newUrl._id,
                originalUrl: newUrl.originalUrl,
                shortCode: newUrl.shortCode,
                shortUrl: newUrl.shortUrl,
                clicks: newUrl.clicks,
                createdAt: newUrl.createdAt
            }
        });

    } catch (error) {
        console.error("Shorten Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET /api/links - Get all links
app.get("/api/links", async (req, res) => {
    try {
        const links = await Url.find().sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: links,
            total: links.length
        });

    } catch (error) {
        console.error("Get Links Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// DELETE /api/links/:id - Delete link
app.delete("/api/links/:id", async (req, res) => {
    try {
        const { id } = req.params;
        
        const deleted = await Url.findByIdAndDelete(id);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Link not found"
            });
        }

        res.json({
            success: true,
            message: "Link deleted successfully",
            data: deleted
        });

    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET /:shortCode - Redirect to original URL
app.get("/:shortCode", async (req, res) => {
    try {
        const { shortCode } = req.params;

        // Find the URL
        const url = await Url.findOne({ shortCode });

        if (!url) {
            return res.status(404).json({
                success: false,
                message: "Short URL not found"
            });
        }

        // Increment clicks
        url.clicks += 1;
        await url.save();

        // Redirect to original URL
        return res.redirect(301, url.originalUrl);

    } catch (error) {
        console.error("Redirect Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Base URL: ${process.env.BASE_URL || "https://snaplink-backend-1.onrender.com"}`);
    console.log(`CORS enabled for: ${process.env.FRONTEND_URL || "All origins"}`);
});