const express = require('express');
const router = express.Router();
const { getSavingsGoals, createGoal, updateGoal, contribute, deleteGoal } = require('../controllers/savingsController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getSavingsGoals).post(createGoal);
router.route('/:id').put(updateGoal).delete(deleteGoal);
router.put('/:id/contribute', contribute);

module.exports = router;
