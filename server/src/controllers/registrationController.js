const Registration = require('../models/Registration');
const Marathon = require('../models/Marathon');
const mongoose = require('mongoose');

// Get user's registrations
const getUserRegistrations = async (req, res) => {
  try {
    const { email } = req.params;
    const { search } = req.query;

    // Verify the requesting user can only access their own registrations
    if (email !== req.decoded.email) {
      return res.status(403).json({ message: 'You can only view your own registrations' });
    }

    let query = { userEmail: email, status: { $ne: 'cancelled' } };

    // Join with Marathon collection to get marathon details
    const registrations = await Registration.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'marathons',
          localField: 'marathonId',
          foreignField: '_id',
          as: 'marathon'
        }
      },
      { $unwind: '$marathon' },
      {
        $project: {
          _id: 1,
          marathonTitle: '$marathon.title',
          marathonStartDate: '$marathon.marathonStartDate',
          firstName: 1,
          lastName: 1,
          contactNo: 1,
          additionalInfo: 1,
          status: 1,
          registrationDate: 1,
          userEmail: 1
        }
      },
      {
        $match: search ? {
          marathonTitle: { $regex: search, $options: 'i' }
        } : {}
      },
      { $sort: { registrationDate: -1 } }
    ]);

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create registration
const createRegistration = async (req, res) => {
  try {
    const marathonId = new mongoose.Types.ObjectId(req.body.marathonId);
    const marathon = await Marathon.findById(marathonId);
    if (!marathon) {
      return res.status(404).json({ message: 'Marathon not found' });
    }

    const existingRegistration = await Registration.findOne({
      marathonId: marathonId,
      userEmail: req.decoded.email,
      status: { $ne: 'cancelled' }
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'You have already registered for this marathon' });
    }

    const registration = new Registration({
      ...req.body,
      marathonId: marathonId,
      userEmail: req.decoded.email,
      userName: req.decoded.name,
    });

    const newRegistration = await registration.save();

    // Increment total registrations by 1
    await Marathon.findByIdAndUpdate(marathonId, {
      $inc: { totalRegistrations: 1 }
    });

    res.status(201).json(newRegistration);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update registration status
const updateRegistrationStatus = async (req, res) => {
  try {
    const registrationId = new mongoose.Types.ObjectId(req.params.id);
    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if the user owns this registration
    if (registration.userEmail !== req.decoded.email) {
      return res.status(403).json({ message: 'You can only update your own registrations' });
    }

    // Update allowed fields
    const allowedUpdates = ['firstName', 'lastName', 'contactNo', 'additionalInfo'];
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        registration[key] = req.body[key];
      }
    });

    const updatedRegistration = await registration.save();
    res.json(updatedRegistration);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cancel registration
const cancelRegistration = async (req, res) => {
  try {
    const registrationId = new mongoose.Types.ObjectId(req.params.id);
    const registration = await Registration.findById(registrationId);
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (registration.userEmail !== req.decoded.email) {
      return res.status(403).json({ message: 'You can only cancel your own registrations' });
    }

    // Check if registration is already cancelled
    if (registration.status === 'cancelled') {
      return res.status(400).json({ message: 'Registration is already cancelled' });
    }

    // Mark as cancelled
    registration.status = 'cancelled';
    await registration.save();

    // Get current marathon
    const marathon = await Marathon.findById(registration.marathonId);
    if (!marathon) {
      return res.status(404).json({ message: 'Marathon not found' });
    }

    // Ensure total registrations doesn't go below 0
    const newTotal = Math.max(0, marathon.totalRegistrations - 1);
    await Marathon.findByIdAndUpdate(registration.marathonId, {
      totalRegistrations: newTotal
    });

    res.json({ 
      message: 'Registration cancelled successfully',
      newTotal: newTotal
    });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Check if user is registered for a marathon
const checkRegistration = async (req, res) => {
  try {
    const { marathonId, email } = req.params;

    // Verify the requesting user can only check their own registrations
    if (email !== req.decoded.email) {
      return res.status(403).json({ message: 'You can only check your own registrations' });
    }

    const registration = await Registration.findOne({
      marathonId: new mongoose.Types.ObjectId(marathonId),
      userEmail: email,
      status: { $ne: 'cancelled' }
    });

    res.json({ isRegistered: !!registration });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserRegistrations,
  createRegistration,
  updateRegistrationStatus,
  cancelRegistration,
  checkRegistration
}; 