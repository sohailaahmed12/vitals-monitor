import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import './App.css';

const API_URL = 'http://localhost:3000';
const MAX_HISTORY = 15;

const THRESHOLDS = {
  heartRate: { low: 60, high: 100 },
  spo2: { low: 94, high: 101 },
  temperature: { low: 36.1, high: 37.8 },
};

function getStatus(key, value) {
  const { low, high } = THRESHOLDS[key];
  if (value < low || value > high) return 'alert';
  return 'normal';
}

function App() {
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [error, setError] = useState('');

  const [connected, setConnected] = useState(false);
  const [patients, setPatients] = useState({});

  async function handleAuth(e) {
    e.preventDefault();
    setError('');
    const endpoint = authMode === 'login' ? '/api/login' : '/api/signup';

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      if (authMode === 'signup') {
        setAuthMode('login');
        setError('Account created — log in below');
        return;
      }

      setToken(data.token);
    } catch (err) {
      setError('Could not reach server');
    }
  }

  useEffect(() => {
    if (!token) return;

    const socket = io(API_URL, {
      auth: { token },
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', (err) => {
      setError('Connection failed: ' + err.message);
      setConnected(false);
    });

    socket.on('vitals-update', (data) => {
      setPatients((prev) => {
        const existing = prev[data.id]?.history || [];
        const updatedHistory = [...existing, data].slice(-MAX_HISTORY);
        return { ...prev, [data.id]: { ...data, history: updatedHistory } };
      });
    });

    return () => socket.disconnect();
  }, [token]);

  if (!token) {
    return (
      <div className="page auth-page">
        <div className="auth-card">
          <h1>Vitals Monitor</h1>
          <p className="subtitle">{authMode === 'login' ? 'Staff login' : 'Create an account'}</p>
          <form onSubmit={handleAuth}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit">{authMode === 'login' ? 'Log in' : 'Sign up'}</button>
          </form>
          {error && <p className="error-text">{error}</p>}
          <p className="toggle-auth">
            {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <span onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setError(''); }}>
              {authMode === 'login' ? 'Sign up' : 'Log in'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  const patientList = Object.values(patients);

  return (
    <div className="page">
      <header className="dashboard-header">
        <h1>Vitals monitor</h1>
        <span className={`status-dot ${connected ? 'online' : 'offline'}`}>
          {connected ? 'Live' : 'Disconnected'}
        </span>
      </header>

      {patientList.length === 0 ? (
        <p className="waiting">Waiting for data...</p>
      ) : (
        <div className="patients-grid">
          {patientList.map((p) => <PatientCard key={p.id} patient={p} />)}
        </div>
      )}
    </div>
  );
}

function PatientCard({ patient }) {
  const hrStatus = getStatus('heartRate', patient.heartRate);
  const spo2Status = getStatus('spo2', patient.spo2);
  const tempStatus = getStatus('temperature', patient.temperature);
  const hasAlert = [hrStatus, spo2Status, tempStatus].includes('alert');

  return (
    <div className={`patient-card ${hasAlert ? 'alert-border' : ''}`}>
      <div className="patient-header">
        <div>
          <p className="patient-name">{patient.name}</p>
          <p className="patient-room">Room {patient.room}</p>
        </div>
        {hasAlert && <span className="alert-badge">Alert</span>}
      </div>
      <div className="vitals-row">
        <VitalBlock label="HR" value={patient.heartRate} unit="bpm" status={hrStatus} />
        <VitalBlock label="SpO2" value={patient.spo2} unit="%" status={spo2Status} />
        <VitalBlock label="Temp" value={patient.temperature} unit="°C" status={tempStatus} />
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={60}>
          <LineChart data={patient.history}>
            <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
            <Line type="monotone" dataKey="heartRate" stroke={hrStatus === 'alert' ? '#f87171' : '#4ade80'} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function VitalBlock({ label, value, unit, status }) {
  return (
    <div className={`vital-block ${status}`}>
      <p className="vital-label">{label}</p>
      <p className="vital-value">{value}<span className="unit">{unit}</span></p>
    </div>
  );
}

export default App;