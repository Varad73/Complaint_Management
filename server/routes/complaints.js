const router = require('express').Router();
const multer = require('multer');
const Complaint = require('../models/Complaint');
const auth = require('../middleware/auth');

// configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// submit complaint (user)
router.post('/', auth, upload.array('attachments', 5), async (req, res) => {
  // MODIFIED: Destructure 'department' instead of 'category'
  const { title, description, department } = req.body;
  const files = (req.files || []).map(f => `/uploads/${f.filename}`);
  
  // MODIFIED: Create complaint with the 'department' field
  const complaint = await Complaint.create({ title, description, department, user: req.user.id, attachments: files });
  res.status(201).json({ complaint });
});

// get my complaints
router.get('/my', auth, async (req, res) => {
  // MODIFIED: Use .populate() to include the department's name with each complaint
  const list = await Complaint.find({ user: req.user.id })
    .populate('department', 'name') // Fetches department details, specifically the 'name' field
    .sort({ createdAt: -1 });
  res.json({ list });
});

// admin: list all complaints
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const all = await Complaint.find()
    .populate('user', 'name email')
    .populate('department', 'name') // MODIFIED: Also populate department for admin view
    .sort({ createdAt: -1 });
  res.json({ all });
});

// admin: update status
router.patch('/:id/status', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const { status } = req.body;
  const c = await Complaint.findByIdAndUpdate(req.params.id, { status }, { new: true });
  res.json({ complaint: c });
});

module.exports = router;