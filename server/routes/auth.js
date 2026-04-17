const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = require('../middleware/auth');

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ✅ FIXED COOKIE
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'None',   // 🔥 REQUIRED
      secure: true        // 🔥 REQUIRED
    });

    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ✅ FIXED COOKIE
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'None',
      secure: true
    });

    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// CURRENT USER
router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json({ user });
});

module.exports = router;