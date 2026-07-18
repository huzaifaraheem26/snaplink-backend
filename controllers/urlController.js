const Url = require("../models/Url");
const { nanoid } = require("nanoid");
const QRCode = require("qrcode");

// Public base URL of this backend (no trailing slash). Set BASE_URL in production.
const BASE_URL = (process.env.BASE_URL || "http://localhost:5000").replace(/\/$/, "");

const shortenUrl = async (req, res) => {
    try {
        const { originalUrl } = req.body;

        if (!originalUrl) {
            return res.status(400).json({
                success: false,
                message: "URL is required",
            });
        }

        const existingUrl = await Url.findOne({ originalUrl });

        if (existingUrl) {
            const shortUrl = `${BASE_URL}/${existingUrl.shortCode}`;
            const qrCode = await QRCode.toDataURL(shortUrl);

            return res.status(200).json({
                success: true,
                message: "URL already exists",
                shortUrl,
                qrCode,
                data: existingUrl,
            });
        }

        const shortCode = nanoid(6);

        const newUrl = await Url.create({
            originalUrl,
            shortCode,
        });

        const shortUrl = `${BASE_URL}/${shortCode}`;
        const qrCode = await QRCode.toDataURL(shortUrl);

        res.status(201).json({
            success: true,
            message: "URL shortened successfully",
            shortUrl,
            qrCode,
            data: newUrl,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const redirectUrl = async (req, res) => {
    try {
        const { shortCode } = req.params;

        const url = await Url.findOne({ shortCode });

        if (!url) {
            return res.status(404).json({
                success: false,
                message: "URL Not Found",
            });
        }

        url.clicks += 1;
        await url.save();

        return res.redirect(url.originalUrl);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getAllLinks = async (req, res) => {
    try {
        const links = await Url.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: links.length,
            data: links,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteLink = async (req, res) => {
    try {
        const { id } = req.params;

        const link = await Url.findById(id);

        if (!link) {
            return res.status(404).json({
                success: false,
                message: "Link not found",
            });
        }

        await Url.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Link deleted successfully",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    shortenUrl,
    redirectUrl,
    getAllLinks,
    deleteLink,
};