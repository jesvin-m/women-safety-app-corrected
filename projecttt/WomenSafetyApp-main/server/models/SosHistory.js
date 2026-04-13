const mongoose = require('mongoose');

const sosHistorySchema = new mongoose.Schema(
  {
    triggeredAt: { type: Date, required: true, index: true },
    socketId: { type: String },
    contactCount: { type: Number, default: 0 },
    latitude: { type: Number },
    longitude: { type: Number },
    messagePreview: { type: String, maxlength: 500 },
    smsStatus: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    smsError: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.SosHistory || mongoose.model('SosHistory', sosHistorySchema);
