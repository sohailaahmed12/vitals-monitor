const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' },
});

const patients = [
  { id: 'p1', name: 'John Carter', room: '204A' },
  { id: 'p2', name: 'Amina Yusuf', room: '207B' },
  { id: 'p3', name: 'Wei Zhang', room: '211A' },
];

io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  const interval = setInterval(() => {
    patients.forEach((patient) => {
      const vitals = generateVitals();
      socket.emit('vitals-update', { ...patient, ...vitals });
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

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});