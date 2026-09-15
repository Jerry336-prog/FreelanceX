import React from 'react';
import { Users, ShieldCheck, Lock, Layers, CalendarCheck } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: <Users />,
      title: 'Find Skilled Talent',
      description: 'Discover highly-rated professionals and specialized agencies across hundreds of different industries and skill categories.'
    },
    {
      icon: <ShieldCheck />,
      title: 'Work With Confidence',
      description: 'Transparent profiles, verified skills, and detailed work histories help you make informed hiring decisions.'
    },
    {
      icon: <Lock />,
      title: 'Secure Payments',
      description: 'Payments are processed securely via Paystack when you approve the completed work.'
    },
    {
      icon: <Layers />,
      title: 'Simple Collaboration',
      description: 'Communicate via chat, manage contracts, share files, and track project milestones all in one centralized platform.'
    },
    {
      icon: <CalendarCheck />,
      title: 'Flexible Opportunities',
      description: 'Freelancers can easily find projects that perfectly match their unique skills, hourly rates, and schedule availability.'
    }
  ];

  return (
    <section id="about" className="py-24 bg-slate-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
          
          <div className="lg:col-span-5 mb-16 lg:mb-0">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Why businesses <br/>
              <span className="text-blue-400">choose FreelanceX</span>
            </h2>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              We provide a secure, intuitive environment where businesses and independent professionals can connect, collaborate, and succeed together. 
            </p>
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white">100% Secure Platform</h4>
                  <p className="text-sm text-slate-400">Enterprise-grade security</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className={`bg-white/5 border border-white/10 p-4 sm:p-6 rounded-2xl hover:bg-white/10 transition-colors ${index === 0 ? 'sm:col-span-2' : ''}`}
                >
                  <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center mb-4">
                    {React.cloneElement(feature.icon, { size: 20 })}
                  </div>
                  <h3 className="text-sm sm:text-xl font-bold mb-2 leading-snug">{feature.title}</h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default About;
