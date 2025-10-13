const router = require('express').Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Complaint = require('../models/Complaint');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// --- EXISTING ROUTES (NO CHANGES) ---

router.post(
  '/', 
  auth, 
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'attachments', maxCount: 5 }
  ]), 
  async (req, res) => {
    try {
      const { title, description, department } = req.body;
      const imagePath = req.files.image ? `/uploads/${req.files.image[0].filename}` : null;
      const attachmentPaths = req.files.attachments ? req.files.attachments.map(f => `/uploads/${f.filename}`) : [];
      
      const complaint = await Complaint.create({ 
        title, 
        description, 
        department, 
        user: req.user.id, 
        image: imagePath,
        attachments: attachmentPaths,
        history: [{ status: 'Submitted' }]
      });
      res.status(201).json({ complaint });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
);

router.get('/my', auth, async (req, res) => {
  const list = await Complaint.find({ user: req.user.id })
    .populate('department', 'name')
    .sort({ createdAt: -1 });
  res.json({ list });
});

router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const { search, status, department } = req.query;
    const filter = {};
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (status) filter.status = status;
    if (department) filter.department = department;

    const all = await Complaint.find(filter)
      .populate('user', 'name email')
      .populate('department', 'name')
      .sort({ createdAt: -1 });
    res.json({ all });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// --- NEW ANALYTICS ROUTE ---

router.get('/stats', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const [complaintsByStatus, complaintsByDepartment, resolutionTime] = await Promise.all([
      Complaint.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } }
      ]),
      Complaint.aggregate([
        {
          $lookup: {
            from: 'departments',
            localField: 'department',
            foreignField: '_id',
            as: 'departmentDetails'
          }
        },
        { $unwind: '$departmentDetails' },
        { $group: { _id: '$departmentDetails.name', count: { $sum: 1 } } },
        { $project: { department: '$_id', count: 1, _id: 0 } }
      ]),
      Complaint.aggregate([
        { $match: { status: { $in: ['Resolved', 'Closed'] } } },
        {
          $project: {
            resolutionTime: { $subtract: ['$updatedAt', '$createdAt'] }
          }
        },
        {
          $group: {
            _id: null,
            avgTime: { $avg: '$resolutionTime' }
          }
        }
      ])
    ]);

    const avgResolutionHours = resolutionTime.length > 0 ? (resolutionTime[0].avgTime / (1000 * 60 * 60)).toFixed(2) : 0;
    
    res.json({
      complaintsByStatus,
      complaintsByDepartment,
      averageResolutionTime: avgResolutionHours
    });

  } catch (e) {
    res.status(500).json({ message: 'Error fetching stats: ' + e.message });
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
    if (!updatedComplaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json({ complaint: updatedComplaint });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    
    const isAdmin = req.user.role === 'admin';
    const isOwner = complaint.user.toString() === req.user.id;
    if (!isAdmin && !isOwner) return res.status(403).json({ message: 'Forbidden' });
    
    const deleteFile = (filePath) => {
      if (!filePath) return;
      const fullPath = path.join(__dirname, '..', filePath);
      fs.unlink(fullPath, (err) => {
        if (err) console.error(`Failed to delete file: ${fullPath}`, err);
      });
    };

    if (complaint.image) deleteFile(complaint.image);
    if (complaint.attachments) complaint.attachments.forEach(file => deleteFile(file));
    
    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: 'Complaint deleted successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;