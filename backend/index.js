const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();
const mongoose = require('mongoose');
const Reading = require('./Reading');
const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' },
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const patients = [
  { id: 'p1', name: 'John Carter', room: '204A' },
  { id: 'p2', name: 'Amina Yusuf', room: '207B' },
  { id: 'p3', name: 'Wei Zhang', room: '211A' },
];

io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  const interval = setInterval(() => {
  patients.forEach(async (patient) => {
    const vitals = generateVitals();
    const readingData = { ...patient, ...vitals };

    socket.emit('vitals-update', readingData);

    try {
      await new Reading({
        patientId: patient.id,
        name: patient.name,
        room: patient.room,
        heartRate: vitals.heartRate,
        spo2: vitals.spo2,
        temperature: vitals.temperature,
      }).save();
    } catch (err) {
      console.error('Failed to save reading:', err);
    }
  });
}, 2000);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(interval);
  });
});

function generateVitals() {
  return {
    heartRate: Math.floor(55 + Math.random() * 55),
    spo2: Math.floor(90 + Math.random() * 10),
    temperature: +(36.2 + Math.random() * 2.3).toFixed(1),
    timestamp: new Date().toISOString(),
  };
}

app.use(express.json());

app.get('/api/readings/:patientId', async (req, res) => {
  const readings = await Reading.find({ patientId: req.params.patientId })
    .sort({ timestamp: -1 })
    .limit(50);
  res.json(readings);
});


server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});