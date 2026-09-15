import React, { useState } from 'react';
import { UserPlus, Search, FileText, CheckCircle, Star, CreditCard } from 'lucide-react';

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState('clients');

  const clientSteps = [
    { icon: <UserPlus />, title: 'Create an account', desc: 'Sign up for free and set up your client profile.' },
    { icon: <FileText />, title: 'Post a job', desc: 'Describe your project and the skills you need.' },
    { icon: <Search />, title: 'Receive proposals', desc: 'Get bids from qualified freelancers in minutes.' },
    { icon: <CheckCircle />, title: 'Hire a freelancer', desc: 'Review profiles, portfolios, and hire the best fit.' },
    { icon: <Star />, title: 'Review completed work', desc: 'Check the deliverables and request revisions if needed.' },
    { icon: <CreditCard />, title: 'Release payment', desc: 'Pay securely only when you are satisfied with the work.' },
  ];

  const freelancerSteps = [
    { icon: <UserPlus />, title: 'Create your profile', desc: 'Highlight your skills, experience, and portfolio.' },
    { icon: <Search />, title: 'Browse available jobs', desc: 'Find projects that match your expertise and interests.' },
    { icon: <FileText />, title: 'Submit proposals', desc: 'Pitch your services and set your desired rate.' },
    { icon: <CheckCircle />, title: 'Get hired', desc: 'Agree on terms and start working on the project.' },
    { icon: <Star />, title: 'Complete the work', desc: 'Deliver high-quality results to your client.' },
    { icon: <CreditCard />, title: 'Get paid', desc: 'Receive secure and timely payments for your hard work.' },
  ];

  const currentSteps = activeTab === 'clients' ? clientSteps : freelancerSteps;

  return (
    <section id="how-it-works" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How FreelanceX Works</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            A simple, secure, and transparent workflow designed to help you get more done.
          </p>
        </div>

        {/* Custom Toggle */}
        <div className="flex justify-center mb-12 md:mb-16">
          <div className="bg-slate-200 p-1 rounded-full inline-flex relative max-w-full">
            <button
              onClick={() => setActiveTab('clients')}
              className={`relative z-10 px-5 sm:px-8 py-3 text-sm font-semibold rounded-full transition-colors ${
                activeTab === 'clients' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              For Clients
            </button>
            <button
              onClick={() => setActiveTab('freelancers')}
              className={`relative z-10 px-5 sm:px-8 py-3 text-sm font-semibold rounded-full transition-colors ${
                activeTab === 'freelancers' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              For Freelancers
            </button>
            {/* Animated pill background */}
            <div
              className={`absolute top-1 bottom-1 w-1/2 bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out`}
              style={{ transform: activeTab === 'clients' ? 'translateX(0)' : 'translateX(100%)' }}
            ></div>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {currentSteps.map((step, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 text-9xl font-bold text-slate-50 opacity-50 group-hover:opacity-100 group-hover:text-blue-50 transition-colors z-0 pointer-events-none select-none">
                {index + 1}
              </div>
              <div className="relative z-10">
                <div className="w-11 h-11 sm:w-14 sm:h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 border border-blue-100">
                  {React.cloneElement(step.icon, { size: 24 })}
                </div>
                <h3 className="text-sm sm:text-base md:text-xl font-bold text-slate-900 mb-2 sm:mb-3 leading-snug">{step.title}</h3>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
