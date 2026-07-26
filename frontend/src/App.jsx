import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3000');

function App() {
  const [connected, setConnected] = useState(false);
  const [vitals, setVitals] = useState(null);

  useEffect(() => {
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('vitals-update', (data) => setVitals(data));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('vitals-update');
    };
  }, []);

  return (
    <div className="page">
      <h1>Vitals Monitor</h1>
      <p>Socket status: {connected ? 'Connected ✅' : 'Disconnected ❌'}</p>

      {vitals ? (
        <div className="vitals">
          <p>Heart rate: {vitals.heartRate} bpm</p>
          <p>SpO2: {vitals.spo2}%</p>
          <p>Temperature: {vitals.temperature}°C</p>
        </div>
      ) : (
        <p>Waiting for data...</p>
      )}
    </div>
  );
}

export default App;