const jwt = require('jsonwebtoken');

module.exports = function(req,res,next){
  try{
    // token from cookie or authorization header
    const token = req.cookies?.token || (req.header('Authorization') || '').replace('Bearer ', '');
    if(!token) return res.status(401).json({ message: 'Unauthorized' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  }catch(e){ res.status(401).json({ message: 'Invalid token' }); }
};
