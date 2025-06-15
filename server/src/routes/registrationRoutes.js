const express = require('express');
const router = express.Router();
const {
  getUserRegistrations,
  createRegistration,
  updateRegistrationStatus,
  cancelRegistration,
  checkRegistration
} = require('../controllers/registrationController');
const verifyToken = require('../middleware/verifyToken');

// All routes are protected
router.use(verifyToken);

// Get user's registrations
router.get('/user/:email', getUserRegistrations);

// Create new registration
router.post('/', createRegistration);

// Update registration status
router.patch('/:id', updateRegistrationStatus);

// Delete registration
router.delete('/:id', cancelRegistration);

// Check if user is registered for a marathon
router.get('/check/:marathonId/:email', checkRegistration);

module.exports = router; 