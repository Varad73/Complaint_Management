const router = require('express').Router();
const multer = require('multer');
const Complaint = require('../models/Complaint');
const auth = require('../middleware/auth');

// configure multer (store uploads in server/uploads)
const storage = multer.diskStorage({
  destination: (req,file,cb)=> cb(null, 'uploads/'),
  filename: (req,file,cb)=> cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// submit complaint (user)
router.post('/', auth, upload.array('attachments', 5), async (req,res)=>{
  const { title, description, category } = req.body;
  const files = (req.files || []).map(f=>`/uploads/${f.filename}`);
  const complaint = await Complaint.create({ title, description, category, user: req.user.id, attachments: files });
  res.json({ complaint });
});

// get my complaints
router.get('/my', auth, async (req,res)=>{
  const list = await Complaint.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ list });
});

// admin: list all complaints
router.get('/', auth, async (req,res)=>{
  if(req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const all = await Complaint.find().populate('user','name email').sort({ createdAt: -1 });
  res.json({ all });
});

// admin: update status
router.patch('/:id/status', auth, async (req,res)=>{
  if(req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const { status } = req.body;
  const c = await Complaint.findByIdAndUpdate(req.params.id, { status }, { new: true });
  res.json({ complaint: c });
});

module.exports = router;

