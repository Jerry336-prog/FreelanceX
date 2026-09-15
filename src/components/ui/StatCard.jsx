import React from 'react';

const StatCard = ({ label, value, subtext, icon, trend, trendUp, color = 'indigo' }) => {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color] || colorMap.indigo}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
    </div>
  );
};

export default StatCard;
