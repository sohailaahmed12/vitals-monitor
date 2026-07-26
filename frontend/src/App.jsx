import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3000');

function App() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      setConnected(true);
      console.log('Connected with id:', socket.id);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return (
    <div className="page">
      <h1>Vitals Monitor</h1>
      <p>Socket status: {connected ? 'Connected ✅' : 'Disconnected ❌'}</p>
    </div>
  );
}

export default App;