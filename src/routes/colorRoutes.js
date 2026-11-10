
const express = require("express");
const extractColors = require("../services/colorExtractor");

const router = express.Router();

router.post(
  "/extract-colors",
  express.raw({
    type: ["image/jpeg", "image/png", "image/webp"],
    limit: "10mb",
  }),
  async (req, res) => {
    try {
      if (!Buffer.isBuffer(req.body) || !req.body.length) {
        return res.status(400).json({
          error: "A valid image is required.",
        });
      }

      const colors = await extractColors(req.body);

      return res.json({
        success: true,
        count: colors.length,
        colors,
      });
    } catch (error) {
      console.error("Color extraction error:", error);

      return res.status(500).json({
        success: false,
        error: "Failed to extract colors.",
      });
    }
  }
);

module.exports = router;
