import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CallToAction = () => {
  return (
    <section className="bg-white">
      <div className="flex flex-col md:flex-row min-h-[500px]">
        
        {/* Client Side */}
        <div className="flex-1 bg-blue-50 p-12 lg:p-24 flex flex-col justify-center items-center text-center md:text-left md:items-start group hover:bg-blue-100 transition-colors duration-500 cursor-pointer">
          <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">Have a project in mind?</h2>
          <p className="text-lg text-slate-600 mb-10 max-w-md">
            Connect with expert freelancers who can bring your ideas to life. Start your project today.
          </p>
          <Link to="/Login" className="inline-flex justify-center items-center px-8 py-4 text-base font-semibold text-white bg-blue-600 rounded-full group-hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30">
            Post a Job
            <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Freelancer Side */}
        <div className="flex-1 bg-slate-900 p-12 lg:p-24 flex flex-col justify-center items-center text-center md:text-left md:items-start group hover:bg-slate-800 transition-colors duration-500 cursor-pointer">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">Ready to turn your skills into opportunities?</h2>
          <p className="text-lg text-slate-400 mb-10 max-w-md">
            Join thousands of professionals earning on their own terms. Create your profile and start bidding.
          </p>
          <Link to="/Signup" className="inline-flex justify-center items-center px-8 py-4 text-base font-semibold text-slate-900 bg-white rounded-full group-hover:bg-slate-100 transition-all shadow-lg hover:shadow-white/20">
            Become a Freelancer
            <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default CallToAction;
