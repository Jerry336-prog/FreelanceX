import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Loader2, MapPin, User as UserIcon } from 'lucide-react';
import { jobService } from '../services/api';

const FeaturedFreelancers = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    jobService.getPublicMarketplaceOverview()
      .then((data) => setFreelancers(data.freelancers || []))
      .catch(() => setFreelancers([]))
      .finally(() => setLoading(false));
  }, []);

  return <section id="freelancers" className="py-24 bg-white"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16"><h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Top rated freelancers</h2><p className="text-lg text-slate-600 max-w-2xl mx-auto">Meet active professionals from the FreelanceX community.</p></div>
    {loading ? <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-blue-600" /></div> : freelancers.length === 0 ? <div className="text-center text-slate-500 py-12">Freelancer profiles will appear here as professionals join the marketplace.</div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{freelancers.map((freelancer) => {
      const name = `${freelancer.firstname || 'Freelancer'} ${freelancer.lastname || ''}`.trim();
      return <div key={freelancer._id || freelancer.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow flex flex-col"><div className="p-6 flex-grow flex flex-col items-center text-center"><div className="relative mb-4 w-24 h-24 rounded-full overflow-hidden border border-slate-200 flex items-center justify-center">{freelancer.profileImage ? <img src={freelancer.profileImage} alt={name} className="w-full h-full object-cover" /> : <UserIcon className="w-9 h-9 text-slate-300" />}{freelancer.isVerified && <BadgeCheck className="absolute bottom-0 right-0 w-6 h-6 text-blue-600 fill-white" />}</div><h3 className="text-xl font-bold text-slate-900 mb-1">{name}</h3><p className="text-sm font-medium text-slate-500 mb-2 min-h-10">{freelancer.professionalTitle || 'Freelancer'}</p>{freelancer.location && <p className="flex items-center gap-1 text-xs text-slate-500 mb-4"><MapPin className="w-3.5 h-3.5" />{freelancer.location}</p>}<div className="flex items-center justify-center gap-3 mb-5 text-sm"><span className="text-green-600 font-bold">{freelancer.completedJobs || 0} jobs</span><span className="w-1 h-1 bg-slate-300 rounded-full" /><span className="text-slate-700 font-bold">{freelancer.hourlyRate ? `₦${freelancer.hourlyRate}/hr` : 'Rate on request'}</span></div><div className="w-full flex flex-wrap justify-center gap-2">{(freelancer.skills || []).slice(0, 3).map((skill) => <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">{skill}</span>)}</div></div><div className="p-4 border-t border-slate-100 bg-slate-50"><Link to="/signup" className="block w-full text-center py-2.5 bg-white border border-slate-200 text-slate-900 text-sm font-semibold rounded-xl hover:border-blue-600 hover:text-blue-600">View Profile</Link></div></div>;
    })}</div>}
  </div></section>;
};
export default FeaturedFreelancers;
