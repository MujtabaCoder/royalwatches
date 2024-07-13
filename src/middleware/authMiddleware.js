const Admin = require('../models/Admin');
const requireAuth = async (req, res, next) => {
    if (!req.session.userId) {
      return res.redirect('/adminloginpage');
    }

    try {
      const user = await Admin.findById(req.session.userId);
      
      if (!user) {
        return res.redirect('/adminloginpage');
      }
  
      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal server error');
    }
  };
  
  const isAdmin = async (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.render('index');
    }
  };
  
  module.exports = { requireAuth, isAdmin };
  