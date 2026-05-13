const express = require('express');
const router = express.Router();
const { getTransactions, addTransaction, updateTransaction, deleteTransaction, getSummary } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/summary', getSummary);
router.route('/').get(getTransactions).post(addTransaction);
router.route('/:id').put(updateTransaction).delete(deleteTransaction);

module.exports = router;
