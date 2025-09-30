const router = require('express').Router();
const multer = require('multer');
const Complaint = require('../models/Complaint');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', auth, upload.array('attachments', 5), async (req, res) => {
  try {
    const { title, description, department } = req.body;
    const files = (req.files || []).map(f => `/uploads/${f.filename}`);
    
    const complaint = await Complaint.create({ 
      title, 
      description, 
      department, 
      user: req.user.id, 
      attachments: files,
      history: [{ status: 'Submitted' }]
    });
    res.status(201).json({ complaint });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/my', auth, async (req, res) => {
  const list = await Complaint.find({ user: req.user.id })
    .populate('department', 'name')
    .sort({ createdAt: -1 });
  res.json({ list });
});

router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

  try {
    const { search, status, department, startDate, endDate } = req.query;
    const filter = {};

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (status) {
      filter.status = status;
    }
    if (department) {
      filter.department = department;
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const all = await Complaint.find(filter)
      .populate('user', 'name email')
      .populate('department', 'name')
      .sort({ createdAt: -1 });
    res.json({ all });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.patch('/:id/status', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const { status } = req.body;
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
