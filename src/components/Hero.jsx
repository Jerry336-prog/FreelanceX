import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Star } from 'lucide-react';
  
const Hero = () => {
  return (
    <section className="relative bg-white pt-16 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-50 blur-3xl opacity-70"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-6 text-center lg:text-left mb-12 lg:mb-0">
            <div className="inline-flex max-w-full items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs sm:text-sm font-semibold mb-6 border border-blue-100">
              <Star className="w-4 h-4 mr-2 fill-current" />
              #1 Freelance Marketplace
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.12] mb-6">
              Find the right talent. <br />
              <span className="text-blue-600">Get great work done.</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-8 sm:mb-10 max-w-2xl mx-auto lg:mx-0">
              Connect with a community of independent professionals and agencies to bring your ideas to life. From quick tasks to complex projects.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Link to="/signup" className="inline-flex justify-center items-center px-8 py-4 text-base font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30">
                Find a Freelancer
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/signup" className=" inline-flex justify-center items-center px-8 py-4 text-base font-semibold text-slate-700 bg-white border-2 border-slate-200 rounded-full hover:border-slate-300 hover:bg-slate-50 transition-all">
                Start Freelancing
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 text-sm font-medium text-slate-500">
              <span>Trusted by 2,000+ companies</span>
              <div className="hidden sm:block h-4 w-px bg-slate-300"></div>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="avatar" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Visual Composition */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl bg-slate-900 shadow-2xl p-2 z-10 transform lg:-rotate-2 transition-transform hover:rotate-0 duration-500">
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Freelancer working on a laptop" 
                className="rounded-xl object-cover h-[280px] sm:h-[340px] lg:h-[400px] w-full opacity-90"
              />
              {/* Floating Cards */}
              <div className="absolute -bottom-5 left-3 sm:-bottom-8 sm:-left-8 bg-white p-3 sm:p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 sm:gap-4 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Star className="w-6 h-6 text-green-600 fill-current" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Completed</p>
                  <p className="text-lg font-bold text-slate-900">Project Approved</p>
                </div>
              </div>

              <div className="absolute top-6 right-3 sm:top-12 sm:-right-8 bg-white p-3 sm:p-4 rounded-xl shadow-xl border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img src="https://i.pravatar.cc/100?img=5" alt="Sarah" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Sarah M.</p>
                    <p className="text-xs text-slate-500">UI/UX Designer</p>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-xs font-medium text-slate-600 text-right">85% Match</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Hero;
