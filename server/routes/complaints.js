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
  try {
    const { title, description, department } = req.body;
    const files = (req.files || []).map(f => `/uploads/${f.filename}`);
    
    // MODIFIED: Also create the initial history entry on creation
    const complaint = await Complaint.create({ 
      title, 
      description, 
      department, 
      user: req.user.id, 
      attachments: files,
      history: [{ status: 'Submitted' }] // ADDED: Initialize the history log
    });
    res.status(201).json({ complaint });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// get my complaints
router.get('/my', auth, async (req, res) => {
  const list = await Complaint.find({ user: req.user.id })
    .populate('department', 'name')
    .sort({ createdAt: -1 });
  res.json({ list });
});

// admin: list all complaints
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const all = await Complaint.find()
    .populate('user', 'name email')
    .populate('department', 'name')
    .sort({ createdAt: -1 });
  res.json({ all });
});

// admin: update status
// MODIFIED: This route now also updates the history log
router.patch('/:id/status', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const { status } = req.body;

    // Use $set to update the status and $push to add a new entry to the history array
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id, 
      { 
        $set: { status }, 
        $push: { history: { status: status } } 
      }, 
      { new: true }
    );

    if (!updatedComplaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({ complaint: updatedComplaint });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;