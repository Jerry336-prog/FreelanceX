import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const FinalCTA = () => {
  return (
    <section className="py-24 bg-blue-600 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      </div>
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
          Your next project starts here.
        </h2>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          Join thousands of businesses and freelancers building the future of work on FreelanceX.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/Login" className="inline-flex justify-center items-center px-8 py-4 text-base font-semibold text-blue-600 bg-white rounded-full hover:bg-slate-50 transition-all shadow-lg hover:shadow-white/20">
            Find Talent
          </Link>
          <Link to="/Signup" className="inline-flex justify-center items-center px-8 py-4 text-base font-semibold text-white bg-transparent border-2 border-blue-400 rounded-full hover:bg-blue-500 transition-all">
            Start Freelancing
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
