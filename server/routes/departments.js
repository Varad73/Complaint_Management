const router = require('express').Router();
const Department = require('../models/Department');
const auth = require('../middleware/auth');

// @route   GET /api/departments
// @desc    Get all available departments
// @access  Private (user must be logged in)
router.get('/', auth, async (req, res) => {
  try {
    // Fetches all departments and sorts them by name alphabetically
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router; 