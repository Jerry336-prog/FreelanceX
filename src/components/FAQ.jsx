import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "What is FreelanceX?",
      answer: "FreelanceX is a premium marketplace connecting businesses with top-tier freelance talent across various industries. We provide a secure platform for posting jobs, hiring professionals, managing projects, and processing payments."
    },
    {
      question: "How do I hire a freelancer?",
      answer: "To hire a freelancer, simply create a client account, post your job detailing the requirements and budget, and review the proposals you receive. You can also browse our freelancer directory and invite specific professionals to apply to your job."
    },
    {
      question: "How do freelancers get paid?",
      answer: "Freelancers are paid via our secure Paystack checkout. Once a client approves the completed work, the payment is made by the client and confirmed by the freelancer directly to their payout balance."
    },
    {
      question: "How do I post a job?",
      answer: "After signing up as a client, click the 'Post a Job' button. Fill out the project title, description, required skills, and budget (fixed price or hourly). Your job will immediately become visible to freelancers in our network."
    },
    {
      question: "Can I apply to multiple jobs?",
      answer: "Yes! Freelancers can apply to as many jobs as they want, provided they have available 'Connects' or proposal credits. We encourage you to only apply for jobs that perfectly match your skill set for the best success rate."
    },
    {
      question: "How do contracts work?",
      answer: "When a client hires a freelancer, a digital contract is automatically created detailing the scope, deadlines, and payment terms (milestones or hourly). Both parties are protected by our Terms of Service and dispute resolution process."
    },
    {
      question: "How are freelancers rated?",
      answer: "After a contract ends, clients leave a public review and a 1-5 star rating based on skills, communication, quality, and adherence to deadlines. This helps maintain a high-quality talent pool on our platform."
    },
    {
      question: "How does payment approval work?",
      answer: "When a freelancer submits work, the client reviews and approves it. After approving, the client completes the payment using Paystack, generates a receipt, and the freelancer confirms receipt."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-slate-600">
            Everything you need to know about the product and billing.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`bg-white border rounded-2xl overflow-hidden transition-colors ${
                openIndex === index ? 'border-blue-200 shadow-sm' : 'border-slate-200'
              }`}
            >
              <button
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <span className={`text-lg font-bold ${openIndex === index ? 'text-blue-600' : 'text-slate-900'}`}>
                  {faq.question}
                </span>
                <ChevronDown 
                  className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                    openIndex === index ? 'transform rotate-180 text-blue-600' : ''
                  }`} 
                />
              </button>
              
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-48 pb-5 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-slate-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
