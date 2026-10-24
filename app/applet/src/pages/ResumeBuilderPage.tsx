import React from 'react';
import { ResumeIntelligencePage } from './ResumeIntelligencePage';

export const ResumeBuilderPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Resume Builder & ATS Analyzer</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-[#0E1524] border border-white/[0.08] rounded-xl">
          <h2 className="text-lg font-bold text-white">1. Overleaf Resume Creation</h2>
          <p className="text-slate-400 text-sm mt-2">Use Overleaf to professionally design your resume.</p>
          <a href="https://www.overleaf.com" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block px-4 py-2 bg-[#FF007A] text-white rounded-lg text-sm font-bold">Open Overleaf</a>
        </div>
        
        <div className="p-6 bg-[#0E1524] border border-white/[0.08] rounded-xl">
          <h2 className="text-lg font-bold text-white">2. ATS Analysis</h2>
          <p className="text-slate-400 text-sm mt-2">Upload your resume for ATS analysis.</p>
          <p className="text-slate-400 text-sm">You can use the Resume Intelligence tool below.</p>
        </div>
      </div>
      
      <div className="p-6 bg-[#0E1524] border border-white/[0.08] rounded-xl">
        <ResumeIntelligencePage />
      </div>
    </div>
  );
};
