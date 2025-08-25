const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, if you have users
  action: { type: String, required: true },
  entityType: { type: String, required: true, enum: ['Course', 'Student', 'Enrollment', 'User'] },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  color: { type: String, default: 'blue' } // For frontend display
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
