const express = require('express');
const router = express.Router();
const { getMonthlyCashFlow, getCashFlowTrends } = require('../controllers/cashflowController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/monthly', getMonthlyCashFlow);
router.get('/trends', getCashFlowTrends);

module.exports = router;
