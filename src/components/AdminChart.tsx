import React from 'react';

export const AdminChart: React.FC = () => {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-750 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-100">Platform Analytics (Page Views & Quiz Requests)</h3>
        <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-full font-medium">Live Metrics</span>
      </div>
      <div className="h-64 flex items-center justify-center relative bg-slate-900/50 rounded-lg border border-slate-700">
        <canvas id="adminMetricsChart" aria-label="Admin metrics line chart" role="img" className="w-full h-full max-h-60" />
      </div>
    </div>
  );
};

export default AdminChart;
