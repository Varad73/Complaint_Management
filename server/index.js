const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const departmentRoutes = require('./routes/departments');

const app = express();

// ✅ CORS (FINAL FIX FOR COOKIES)
app.use(cors({
  origin: "https://complaint-management-murex.vercel.app", // ❗ exact frontend URL
  credentials: true
}));

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// ✅ MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// ✅ Routes (WITH /api PREFIX)
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/departments', departmentRoutes);

// ✅ Test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));