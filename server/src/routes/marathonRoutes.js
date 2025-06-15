const express = require('express');
const router = express.Router();
const {
  getAllMarathons,
  getFeaturedMarathons,
  getMarathon,
  createMarathon,
  updateMarathon,
  deleteMarathon,
  searchMarathons,
  getUpcomingMarathons,
  getMarathonsByOrganizer,
} = require('../controllers/marathonController');
const verifyToken = require('../middleware/verifyToken');
const Marathon = require('../models/Marathon');

// Public routes
router.get('/', getAllMarathons);
router.get('/featured', getFeaturedMarathons);
router.get('/upcoming', getUpcomingMarathons);
router.get('/search', searchMarathons);
router.get('/:id', getMarathon);

// Protected routes
router.use(verifyToken);
router.post('/', createMarathon);
router.patch('/:id', updateMarathon);
router.delete('/:id', deleteMarathon);
router.get('/organizer/:email', getMarathonsByOrganizer);

module.exports = router; 