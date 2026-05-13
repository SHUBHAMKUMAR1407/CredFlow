const express = require('express');
const router = express.Router();
const { getCreditScore, recalculateScore, getScoreHistory } = require('../controllers/creditScoreController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getCreditScore);
router.post('/recalculate', recalculateScore);
router.get('/history', getScoreHistory);

module.exports = router;
