import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Briefcase, Loader2, MapPin, MessageSquare, ShieldCheck, Star, User as UserIcon } from 'lucide-react';
import { userService } from '../../services/api';

const FreelancerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [freelancer, setFreelancer] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setFreelancer(await userService.getPublicFreelancerProfile(id));
      } catch (err) {
        setError(err?.message || 'This freelancer profile is unavailable.');
      }
    };
    if (id) loadProfile();
  }, [id]);

  if (!freelancer && !error) return <div className="py-24 flex flex-col items-center gap-3 text-slate-500"><Loader2 className="w-7 h-7 animate-spin text-blue-600" /><span className="text-sm">Loading freelancer profile…</span></div>;
  if (error) return <div className="max-w-xl mx-auto py-20 text-center"><p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-4">{error}</p><button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 text-sm font-semibold text-blue-600">Go back</button></div>;

  const fullName = `${freelancer.firstname || 'Freelancer'} ${freelancer.lastname || ''}`.trim();
  const rate = freelancer.hourlyRate ? `₦${Number(freelancer.hourlyRate).toLocaleString()}/hr` : 'Rate available on request';

  return <div className="max-w-5xl mx-auto pb-12">
    <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900"><ArrowLeft className="w-4 h-4 mr-1" />Back</button>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <aside className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
          <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border border-slate-200 mb-4 flex items-center justify-center">{freelancer.profileImage ? <img src={freelancer.profileImage} alt={fullName} className="w-full h-full object-cover" /> : <UserIcon className="w-10 h-10 text-slate-300" />}</div>
          <div className="flex justify-center items-center gap-1.5"><h1 className="text-xl font-bold text-slate-900">{fullName}</h1>{freelancer.isVerified && <BadgeCheck className="w-5 h-5 text-blue-600" />}</div>
          <p className="text-sm text-slate-500 mt-1">{freelancer.professionalTitle || 'Freelancer'}</p>
          {freelancer.location && <p className="mt-3 flex items-center justify-center gap-1 text-xs text-slate-500"><MapPin className="w-3.5 h-3.5" />{freelancer.location}</p>}
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 text-left"><div><p className="text-[10px] font-bold uppercase text-slate-400">Hourly rate</p><p className="text-sm font-bold text-slate-900 mt-1">{rate}</p></div><div><p className="text-[10px] font-bold uppercase text-slate-400">Completed jobs</p><p className="text-sm font-bold text-slate-900 mt-1">{freelancer.completedJobs || 0}</p></div></div>
          <Link to={`/client/messages?recipient=${freelancer._id}`} className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><MessageSquare className="w-4 h-4" />Message</Link>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"><div className="flex gap-2"><ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" /><div><p className="text-sm font-bold text-slate-900">Secure payment profile</p><p className="text-xs leading-5 text-slate-500 mt-1">Payment details are handled securely through FreelanceX and are never exposed on a public profile.</p></div></div></div>
      </aside>
      <section className="md:col-span-2 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm"><div className="flex items-center gap-2 mb-5"><Briefcase className="w-5 h-5 text-blue-600" /><h2 className="text-lg font-bold text-slate-900">About</h2></div><p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">{freelancer.bio || 'This freelancer has not added an overview yet.'}</p><div className="mt-7 pt-6 border-t border-slate-100"><h3 className="text-sm font-bold text-slate-900 mb-3">Skills</h3><div className="flex flex-wrap gap-2">{freelancer.skills?.length ? freelancer.skills.map((skill) => <span key={skill} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100">{skill}</span>) : <span className="text-sm text-slate-400">No skills listed yet.</span>}</div></div></div>
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm"><div className="flex items-center gap-2"><Star className="w-5 h-5 text-amber-500 fill-amber-400" /><h2 className="text-lg font-bold text-slate-900">Client feedback</h2></div><p className="mt-3 text-sm text-slate-600">{freelancer.rating ? `${Number(freelancer.rating).toFixed(1)} average rating from ${freelancer.totalReviews || 0} review${freelancer.totalReviews === 1 ? '' : 's'}.` : 'No reviews yet.'}</p></div>
      </section>
    </div>
  </div>;
};

export default FreelancerProfile;
