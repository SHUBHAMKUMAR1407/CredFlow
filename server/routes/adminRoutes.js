const express = require('express');
const router = express.Router();
const { getUsers, getStats, getActivity, updateUserRole } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.use(protect, admin);
router.get('/users', getUsers);
router.get('/stats', getStats);
router.get('/activity', getActivity);
router.put('/users/:id/role', updateUserRole);

module.exports = router;
