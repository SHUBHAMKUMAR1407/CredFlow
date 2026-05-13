const { generateSuggestions } = require('../services/aiSuggestions');

// @route GET /api/smart/suggestions
exports.getSuggestions = async (req, res) => {
  try {
    const suggestions = await generateSuggestions(req.user._id);
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
