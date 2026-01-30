
import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { ResumeAnalysis } from '../types';

interface Props {
  data: ResumeAnalysis;
  onStartInterview: () => void;
}

const AnalysisDashboard: React.FC<Props> = ({ data, onStartInterview }) => {
  if (!data || !data.metrics) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-100">
        Analysis data is incomplete. Please try uploading again.
      </div>
    );
  }

  const radarData = [
    { subject: 'Formatting', A: data.metrics.formatting || 0, fullMark: 100 },
    { subject: 'Content', A: data.metrics.contentQuality || 0, fullMark: 100 },
    { subject: 'ATS', A: data.metrics.atsCompatibility || 0, fullMark: 100 },
    { subject: 'Keywords', A: data.metrics.keywordUsage || 0, fullMark: 100 },
  ];

  const getColorClass = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
          <h3 className="text-slate-500 font-medium uppercase tracking-wider text-xs">Overall ATS Score</h3>
          <div className={`text-7xl font-bold mt-4 ${getColorClass(data.atsScore)}`}>
            {data.atsScore}<span className="text-3xl text-slate-300">/100</span>
          </div>
          <p className="mt-4 text-slate-600 italic">"{data.executiveSummary?.substring(0, 100)}..."</p>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-slate-800 font-bold mb-6">Performance Radar</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <Radar 
                  name="Score" 
                  dataKey="A" 
                  stroke="#4f46e5" 
                  fill="#4f46e5" 
                  fillOpacity={0.6} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Domain Recommendation */}
      <div className="bg-indigo-600 text-white p-10 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1">
          <span className="bg-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Recommended Domain</span>
          <h2 className="text-4xl font-bold mt-4">{data.recommendedDomain.title}</h2>
          <p className="mt-4 text-indigo-100 text-lg leading-relaxed">{data.recommendedDomain.justification}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {data.recommendedDomain.potentialRoles.map(role => (
              <span key={role} className="bg-white/20 px-3 py-1 rounded-lg text-sm">{role}</span>
            ))}
          </div>
        </div>
        <div className="shrink-0">
          <button 
            onClick={onStartInterview}
            className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all shadow-lg hover:-translate-y-1"
          >
            Practice Mock Interview
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="font-bold text-emerald-600 flex items-center gap-2 mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Key Strengths
          </h4>
          <ul className="space-y-3">
            {data.strengths.map((s, i) => (
              <li key={i} className="text-slate-600 text-sm leading-relaxed pl-4 border-l-2 border-emerald-100">{s}</li>
            ))}
          </ul>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="font-bold text-rose-600 flex items-center gap-2 mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Critical Weaknesses
          </h4>
          <ul className="space-y-3">
            {data.weaknesses.map((w, i) => (
              <li key={i} className="text-slate-600 text-sm leading-relaxed pl-4 border-l-2 border-rose-100">{w}</li>
            ))}
          </ul>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="font-bold text-amber-600 flex items-center gap-2 mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Actionable Improvements
          </h4>
          <ul className="space-y-3">
            {data.improvements.map((imp, i) => (
              <li key={i} className="text-slate-600 text-sm leading-relaxed pl-4 border-l-2 border-amber-100">{imp}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
