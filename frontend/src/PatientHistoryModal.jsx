import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = 'http://localhost:3000';

function PatientHistoryModal({ patient, token, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/readings/${patient.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        // reverse so chart reads oldest → newest, left to right
        setHistory(data.reverse());
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [patient.id, token]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="patient-name">{patient.name}</p>
            <p className="patient-room">Room {patient.room} — history</p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <p className="waiting">Loading history...</p>
        ) : (
          <>
            <div className="modal-chart">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2d35" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    stroke="#6b7280"
                    fontSize={11}
                  />
                  <YAxis stroke="#6b7280" fontSize={11} />
                  <Tooltip
                    contentStyle={{ background: '#1a1d24', border: '1px solid #2a2d35', borderRadius: 8 }}
                    labelFormatter={(t) => new Date(t).toLocaleTimeString()}
                  />
                  <Line type="monotone" dataKey="heartRate" stroke="#4ade80" strokeWidth={2} dot={false} name="Heart rate" />
                  <Line type="monotone" dataKey="spo2" stroke="#60a5fa" strokeWidth={2} dot={false} name="SpO2" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <table className="history-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>HR</th>
                  <th>SpO2</th>
                  <th>Temp</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(-10).reverse().map((r) => (
                  <tr key={r._id}>
                    <td>{new Date(r.timestamp).toLocaleTimeString()}</td>
                    <td>{r.heartRate}</td>
                    <td>{r.spo2}%</td>
                    <td>{r.temperature}°C</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

export default PatientHistoryModal;