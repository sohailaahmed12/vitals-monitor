const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  name: String,
  room: String,
  heartRate: Number,
  spo2: Number,
  temperature: Number,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Reading', readingSchema);