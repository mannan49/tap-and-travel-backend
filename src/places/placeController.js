import axios from "axios";
import config from "../config/index.js";
import { Place } from "./placeModel.js";

export const placeSearchController = async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const cached = await Place.findOne({ query });

    if (cached) {
      return res.json({
        cached: true,
        totalCount: cached.totalCount,
        status: cached.status,
        results: cached.results,
      });
    }

    const baseUrl = "https://maps.googleapis.com/maps/api/place/textsearch/json";
    const aggregatedResults = [];
    let pageToken = null;
    let attempts = 0;
    let status = "OK";

    do {
      const params = {
        query,
        key: config.GOOGLE_MAPS_API_KEY,
      };

      if (pageToken) {
        params.pagetoken = pageToken;
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      const response = await axios.get(baseUrl, { params });

      if (
        response.data.status !== "OK" &&
        response.data.status !== "ZERO_RESULTS"
      ) {
        return res.status(500).json({
          error: "Google Maps API Error",
          status: response.data.status,
        });
      }

      const { results, next_page_token } = response.data;
      aggregatedResults.push(...results);
      pageToken = next_page_token;
      status = response.data.status;
      attempts++;
    } while (pageToken && attempts < 15); // up to 15 attempts

    // Store in DB
    await Place.create({
      query,
      results: aggregatedResults,
      totalCount: aggregatedResults.length,
      status,
    });

    res.json({
      cached: false,
      totalCount: aggregatedResults.length,
      status,
      results: aggregatedResults,
    });
  } catch (err) {
    console.error("Google Places API Error:", err.message);
    next(err);
  }
};

