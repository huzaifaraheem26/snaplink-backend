const express = require("express");
const router = express.Router();

const {
    shortenUrl,
    redirectUrl,
    getAllLinks,
    deleteLink
} = require("../controllers/urlController");

router.post("/shorten", shortenUrl);
router.get("/links", getAllLinks);
router.delete("/links/:id", deleteLink);
router.get("/:shortCode", redirectUrl);


module.exports = router;