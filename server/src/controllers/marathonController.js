const Marathon = require('../models/Marathon');

// Get all marathons
const getAllMarathons = async (req, res) => {
  try {
    const marathons = await Marathon.find().sort({ createdAt: -1 });
    res.json(marathons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get marathons by organizer
const getMarathonsByOrganizer = async (req, res) => {
  try {
    const { email } = req.params;
    const marathons = await Marathon.find({ organizer: email }).sort({ createdAt: -1 });
    res.json(marathons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get upcoming marathons
const getUpcomingMarathons = async (req, res) => {
  try {
    const currentDate = new Date();
    const marathons = await Marathon.find({
      marathonStartDate: { $gte: currentDate }
    })
    .sort({ marathonStartDate: 1 })
    .limit(6);
    res.json(marathons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get featured marathons
const getFeaturedMarathons = async (req, res) => {
  try {
    const marathons = await Marathon.find().sort({ totalRegistrations: -1 }).limit(6);
    res.json(marathons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single marathon
const getMarathon = async (req, res) => {
  try {
    const marathon = await Marathon.findById(req.params.id);
    if (!marathon) {
      return res.status(404).json({ message: 'Marathon not found' });
    }
    res.json(marathon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create marathon
const createMarathon = async (req, res) => {
  try {
    // Validate dates
    const now = new Date();
    const { startRegistrationDate, endRegistrationDate, marathonStartDate } = req.body;

    if (new Date(startRegistrationDate) < now) {
      return res.status(400).json({ message: 'Start registration date cannot be in the past' });
    }

    if (new Date(endRegistrationDate) <= new Date(startRegistrationDate)) {
      return res.status(400).json({ message: 'End registration date must be after start registration date' });
    }

    if (new Date(marathonStartDate) <= new Date(endRegistrationDate)) {
      return res.status(400).json({ message: 'Marathon start date must be after end registration date' });
    }

    const marathon = new Marathon({
      ...req.body,
      organizer: req.decoded.email,
      totalRegistrations: 0,
      createdAt: new Date()
    });

    const newMarathon = await marathon.save();
    res.status(201).json(newMarathon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update marathon
const updateMarathon = async (req, res) => {
  try {
    const marathon = await Marathon.findById(req.params.id);
    if (!marathon) {
      return res.status(404).json({ message: 'Marathon not found' });
    }
    
    if (marathon.organizer !== req.decoded.email) {
      return res.status(403).json({ message: 'You can only update your own marathons' });
    }

    // Validate dates if they are being updated
    if (req.body.startRegistrationDate || req.body.endRegistrationDate || req.body.marathonStartDate) {
      const startDate = new Date(req.body.startRegistrationDate || marathon.startRegistrationDate);
      const endDate = new Date(req.body.endRegistrationDate || marathon.endRegistrationDate);
      const marathonDate = new Date(req.body.marathonStartDate || marathon.marathonStartDate);

      if (endDate <= startDate) {
        return res.status(400).json({ message: 'End registration date must be after start registration date' });
      }

      if (marathonDate <= endDate) {
        return res.status(400).json({ message: 'Marathon start date must be after end registration date' });
      }
    }

    Object.assign(marathon, req.body);
    const updatedMarathon = await marathon.save();
    res.json(updatedMarathon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete marathon
const deleteMarathon = async (req, res) => {
  try {
    const marathon = await Marathon.findById(req.params.id);
    if (!marathon) {
      return res.status(404).json({ message: 'Marathon not found' });
    }

    if (marathon.organizer !== req.decoded.email) {
      return res.status(403).json({ message: 'You can only delete your own marathons' });
    }

    await marathon.deleteOne();
    res.json({ message: 'Marathon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search marathons
const searchMarathons = async (req, res) => {
  try {
    const { title } = req.params;
    const marathons = await Marathon.find({
      title: { $regex: title, $options: 'i' }
    });
    res.json(marathons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllMarathons,
  getUpcomingMarathons,
  getFeaturedMarathons,
  getMarathon,
  createMarathon,
  updateMarathon,
  deleteMarathon,
  searchMarathons,
  getMarathonsByOrganizer,
}; 