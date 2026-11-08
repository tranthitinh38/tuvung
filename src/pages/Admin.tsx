import React, { useEffect, useState } from 'react';
import AdminChart from '../components/AdminChart';

interface Metric {
  name: string;
  value: number;
}

const Admin: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then((res) => res.json())
      .then((data) => setMetrics(data.metrics || []))
      .catch(() => {
        // Fallback dummy metrics
        setMetrics([
          { name: 'Page Views', value: 14280 },
          { name: 'Quiz Requests', value: 3950 },
          { name: 'Active Users', value: 890 }
        ]);
      });
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-900 min-h-screen text-slate-100">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Monitor VOCABWORLD AI platform analytics and user activity.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.length === 0 ? (
          <div className="p-4 bg-slate-800 rounded-lg">Loading metrics...</div>
        ) : (
          metrics.map((m) => (
            <div key={m.name} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-md">
              <p className="text-sm font-medium text-slate-400">{m.name}</p>
              <p className="text-3xl font-bold text-indigo-400 mt-2">{m.value.toLocaleString()}</p>
            </div>
          ))
        )}
      </div>

      {/* Chart Section */}
      <AdminChart />
    </div>
  );
};

export default Admin;
