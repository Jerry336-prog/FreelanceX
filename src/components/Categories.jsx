import { useEffect, useState } from 'react';
import { Briefcase, Code, Database, PenTool, TrendingUp } from 'lucide-react';
import { jobService } from '../services/api';

const iconFor = (name) => {
  const value = name.toLowerCase();
  if (value.includes('design')) return PenTool;
  if (value.includes('data') || value.includes('ai')) return Database;
  if (value.includes('market')) return TrendingUp;
  if (value.includes('develop') || value.includes('tech')) return Code;
  return Briefcase;
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  useEffect(() => { jobService.getPublicMarketplaceOverview().then((data) => setCategories(data.categories || [])).catch(() => setCategories([])); }, []);
  return <section className="py-24 bg-slate-50 border-y border-slate-200"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center mb-16"><h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Popular Categories</h2><p className="text-lg text-slate-600 max-w-2xl mx-auto">Browse active opportunities by category.</p></div>{categories.length === 0 ? <p className="text-center text-slate-500">Categories appear as clients post jobs.</p> : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">{categories.map((category) => { const Icon = iconFor(category.name); return <a key={category.name} href="#browse-jobs" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col items-center text-center"><div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4"><Icon size={30} strokeWidth={1.5} /></div><h3 className="text-sm font-bold text-slate-900 mb-1 capitalize">{category.name}</h3><p className="text-xs font-medium text-slate-500">{category.jobs} open job{category.jobs === 1 ? '' : 's'}</p></a>; })}</div>}</div></section>;
};
export default Categories;
