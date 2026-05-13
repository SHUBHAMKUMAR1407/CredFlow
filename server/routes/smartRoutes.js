const express = require('express');
const router = express.Router();
const { getSuggestions } = require('../controllers/smartController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/suggestions', getSuggestions);

module.exports = router;
