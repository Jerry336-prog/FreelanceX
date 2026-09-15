import React from 'react';

const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="border-b border-slate-200 mb-6">
      <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }
            `}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium md:inline-block ${
                activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-900'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;
