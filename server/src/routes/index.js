const express = require('express');
const router = express.Router();
const marathonRoutes = require('./marathonRoutes');
const registrationRoutes = require('./registrationRoutes');
const jwt = require('jsonwebtoken');

// JWT Token Generation
router.post('/jwt', async (req, res) => {
  try {
    const user = req.body;
    if (!user.email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('JWT generation error:', error);
    res.status(500).json({ message: 'Error generating token' });
  }
});

// Marathon routes
router.use('/marathons', marathonRoutes);
router.use('/registrations', registrationRoutes);

module.exports = router; 