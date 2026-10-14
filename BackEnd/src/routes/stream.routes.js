const express = require("express");
const streamController = require("../controllers/stream.controller.js");

const router = express.Router();

// Route: GET /api/youtube/streams
// You can protect this with authMiddleware if only logged-in gang members should see it
router.get("/live", streamController.getLiveStreams);
router.get("/video", streamController.getVideosByKeyword);

module.exports = router;
