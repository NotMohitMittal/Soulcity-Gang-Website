const axios = require("axios");

const getLiveStreams = async (req, res) => {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    // You can pass a hashtag or keyword via query parameters to filter streams
    const searchQuery = req.query.keyword || "#gaming"; // changing this to #lifeinsoulcity in future

    // 1. Search for active live streams
    const searchResponse = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
      params: {
        part: "snippet",
        type: "video",
        eventType: "live", // This strictly filters for ongoing live streams
        q: searchQuery,
        maxResults: 49,
        key: apiKey,
      },
    });

    // Extract the video IDs to fetch detailed stats
    const videoIds = searchResponse.data.items.map((item) => item.id.videoId).join(",");

    if (!videoIds) {
      return res.status(404).json({
        message: "No active live streams found for this query",
      });
    }

    // 2. Fetch detailed metrics (concurrent viewers, likes, start times)
    const videoResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
      params: {
        // Requesting statistics and liveStreamingDetails is required for viewer counts
        part: "snippet,statistics,liveStreamingDetails",
        id: videoIds,
        key: apiKey,
      },
    });

    res.status(200).json({
      message: "Live streams fetched successfully",
      streams: videoResponse.data.items,
    });
  } catch (error) {
    console.error("YouTube API Error:", error?.response?.data || error);
    res.status(500).json({
      message: "Error while fetching YouTube streams",
    });
  }
};

const getVideosByKeyword = async (req, res) => {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    // Uses the keyword passed from the frontend, defaults to your gang server content
    const searchQuery = req.query.keyword || "#lifeinsoulcity";

    // 1. Search for standard videos
    const searchResponse = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
      params: {
        part: "snippet",
        type: "video",
        // Notice eventType: "live" is completely removed here
        q: searchQuery,
        maxResults: 49,
        key: apiKey,
      },
    });

    const videoIds = searchResponse.data.items.map((item) => item.id.videoId).join(",");

    if (!videoIds) {
      return res.status(404).json({
        message: "No videos found for this keyword",
      });
    }

    // 2. Fetch detailed metrics (total views, likes, and video duration)
    const videoResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
      params: {
        // Swapped liveStreamingDetails for contentDetails to get video length
        part: "snippet,statistics,contentDetails",
        id: videoIds,
        key: apiKey,
      },
    });

    res.status(200).json({
      message: "Videos fetched successfully",
      videos: videoResponse.data.items,
    });
  } catch (error) {
    console.error("YouTube API Error:", error?.response?.data || error);
    res.status(500).json({
      message: "Error while fetching YouTube videos",
    });
  }
};


module.exports = { getLiveStreams, getVideosByKeyword };
