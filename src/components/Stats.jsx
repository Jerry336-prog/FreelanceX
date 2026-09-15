import { useEffect, useState } from 'react';
import { jobService } from '../services/api';

const Stats = () => {
  const [stats, setStats] = useState(null);
  useEffect(() => { jobService.getPublicMarketplaceOverview().then((data) => setStats(data.stats)).catch(() => setStats({})); }, []);
  const data = [
    { label: 'Freelancers', value: stats?.freelancers ?? '—' },
    { label: 'Jobs Completed', value: stats?.jobsCompleted ?? '—' },
    { label: 'Clients', value: stats?.clients ?? '—' },
    { label: 'Projects Posted', value: stats?.projectsPosted ?? '—' },
  ];
  return <section className="bg-slate-900 py-16 border-y border-slate-800 relative z-10"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-800">{data.map((stat) => <div key={stat.label} className="flex flex-col items-center"><span className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</span><span className="text-sm md:text-base font-medium text-slate-400">{stat.label}</span></div>)}</div></div></section>;
};
export default Stats;
