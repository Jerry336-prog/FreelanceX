import React from 'react';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import HowItWorks from '../components/HowItWorks';
import BrowseJobs from '../components/BrowseJobs';
import Categories from '../components/Categories';
import FeaturedFreelancers from '../components/FeaturedFreelancers';
import About from '../components/About';
import CallToAction from '../components/CallToAction';
import FAQ from '../components/FAQ';
import FinalCTA from '../components/FinalCTA';

const PublicLanding = () => {
  return (
    <>
      <Hero />
      <Stats />
      <HowItWorks />
      <BrowseJobs />
      <Categories />
      <FeaturedFreelancers />
      <About />
      <CallToAction />
      <FAQ />
      <FinalCTA />
    </>
  );
};

export default PublicLanding;
