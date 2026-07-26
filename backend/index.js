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

io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  const interval = setInterval(() => {
    const vitals = generateVitals();
    socket.emit('vitals-update', vitals);
  }, 2000);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(interval);
  });
});

function generateVitals() {
  return {
    heartRate: Math.floor(60 + Math.random() * 40), // 60–100 bpm
    spo2: Math.floor(95 + Math.random() * 5), // 95–100%
    temperature: (36.5 + Math.random() * 1.5).toFixed(1), // 36.5–38.0 °C
    timestamp: new Date().toISOString(),
  };
}

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});