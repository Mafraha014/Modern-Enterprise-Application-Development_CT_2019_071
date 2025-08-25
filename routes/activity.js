const express = require('express');
const Activity = require('../models/Activity');
const router = express.Router();

// Helper function to log activity (can be used by other routes)
const logActivity = async (action, entityType, entityId, message, color = 'blue') => {
  try {
    const activity = new Activity({ action, entityType, entityId, message, color });
    await activity.save();
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// GET recent activities
router.get('/', async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ timestamp: -1 })
      .limit(10);
    res.json({ activities });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
module.exports.logActivity = logActivity;
