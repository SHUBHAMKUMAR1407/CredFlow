const express = require('express');
const router = express.Router();
const { getUsers, getStats, getActivity, updateUserRole, deleteUser } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.use(protect, admin);
router.get('/users', getUsers);
router.get('/stats', getStats);
router.get('/activity', getActivity);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
