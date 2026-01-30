
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ResumeUpload from './components/ResumeUpload';
import AnalysisDashboard from './components/AnalysisDashboard';
import InterviewRoom from './components/InterviewRoom';
import { ResumeAnalysis, InterviewConfig, InterviewResult } from './types';

const App: React.FC = () => {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig | null>(null);
  const [interviewResult, setInterviewResult] = useState<InterviewResult | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    if (analysis) {
      console.log("App State: Analysis data loaded.");
    }
  }, [analysis]);

  const handleStartInterview = () => {
    setShowConfig(true);
  };

  const handleLaunchInterview = (config: InterviewConfig) => {
    setInterviewConfig(config);
    setShowConfig(false);
  };

  const handleAnalysisComplete = (data: ResumeAnalysis | null) => {
    setIsAnalyzing(false);
    if (data) {
      setAnalysis(data);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setIsAnalyzing(false);
    setInterviewConfig(null);
    setInterviewResult(null);
    setShowConfig(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onReset={handleReset} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Step 1: Upload */}
        {!analysis && !isAnalyzing && (
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
              Bridge the Gap to Your <span className="text-indigo-600">Dream Career</span>
            </h1>
            <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto">
              Analyze your resume, discover your perfect career domain, and practice with real-time AI mock interviews.
            </p>
            <ResumeUpload 
              onAnalysisStart={() => setIsAnalyzing(true)} 
              onAnalysisComplete={handleAnalysisComplete} 
            />
          </div>
        )}

        {/* Step 2: Loading State */}
        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
            </div>
            <p className="text-lg font-medium text-slate-600">Gemini is deconstructing your career history...</p>
          </div>
        )}

        {/* Step 3: Analysis Dashboard */}
        {analysis && !interviewConfig && !interviewResult && !showConfig && (
          <div className="animate-fade-in">
             <AnalysisDashboard data={analysis} onStartInterview={handleStartInterview} />
          </div>
        )}

        {/* Step 4: Interview Config */}
        {showConfig && analysis && (
          <div className="max-w-xl mx-auto bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 animate-slide-up">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Setup Your Mock Interview</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Domain</label>
                <input 
                  type="text" 
                  value={analysis.recommendedDomain.title} 
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-600"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Difficulty Level</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Junior', 'Mid-Level', 'Senior', 'Expert'].map(level => (
                    <button 
                      key={level}
                      onClick={() => setInterviewConfig(prev => ({ ...prev!, difficulty: level as any }))}
                      className={`px-4 py-3 rounded-xl border-2 transition-all ${
                        interviewConfig?.difficulty === level ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Number of Questions</label>
                <input 
                  type="range" 
                  min="3" 
                  max="15" 
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  onChange={(e) => setInterviewConfig(prev => ({ ...prev!, questionCount: parseInt(e.target.value) }))}
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2 font-bold">
                  <span>3 Questions</span>
                  <span>{interviewConfig?.questionCount || 5} Questions</span>
                  <span>15 Questions</span>
                </div>
              </div>
              <button 
                onClick={() => handleLaunchInterview(interviewConfig || { domain: analysis.recommendedDomain.title, difficulty: 'Junior', questionCount: 5 })}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg"
              >
                Launch Interview
              </button>
              <button 
                onClick={() => setShowConfig(false)}
                className="w-full py-2 text-slate-400 hover:text-slate-600 text-sm font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Interview Room */}
        {interviewConfig && !interviewResult && (
          <InterviewRoom 
            config={interviewConfig} 
            onFinish={(result) => { setInterviewResult(result); setInterviewConfig(null); }} 
          />
        )}

        {/* Step 6: Results */}
        {interviewResult && (
          <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
            <div className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100 text-center">
              <h2 className="text-4xl font-extrabold text-slate-900">Interview Evaluation</h2>
              <div className="flex justify-center mt-10">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-slate-100" />
                    <circle 
                      cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="16" fill="transparent" 
                      strokeDasharray={2 * Math.PI * 80}
                      strokeDashoffset={2 * Math.PI * 80 * (1 - (interviewResult.accuracy || 0) / 100)}
                      className="text-indigo-600 transition-all duration-1000" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-slate-900">{interviewResult.accuracy || 0}%</span>
                    <span className="text-xs font-bold text-slate-400 uppercase">Accuracy</span>
                  </div>
                </div>
              </div>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="bg-slate-50 p-8 rounded-2xl">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Knowledge Grasp
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{interviewResult.knowledgeGrasp}</p>
                </div>
                <div className="bg-slate-50 p-8 rounded-2xl">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Expression Analysis
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{interviewResult.expressionAnalysis}</p>
                </div>
              </div>

              <div className="mt-8 p-8 bg-indigo-50 rounded-2xl text-left border border-indigo-100">
                 <h3 className="font-bold text-indigo-900 mb-2">Coach's Feedback</h3>
                 <p className="text-indigo-800 italic leading-relaxed">"{interviewResult.feedback}"</p>
              </div>

              <button 
                onClick={() => setInterviewResult(null)}
                className="mt-12 px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">Powered by Gemini 2.5/3.0 &bull; CareerEdge AI &copy; 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
