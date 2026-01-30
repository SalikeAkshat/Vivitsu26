
import React, { useState } from 'react';
import { analyzeResume } from '../services/geminiService';

interface Props {
  onAnalysisStart: () => void;
  onAnalysisComplete: (data: any) => void;
}

const ResumeUpload: React.FC<Props> = ({ onAnalysisStart, onAnalysisComplete }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;
    
    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a PDF or an Image (JPG/PNG).");
      return;
    }

    onAnalysisStart();
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const resultRaw = e.target?.result as string;
        if (!resultRaw) throw new Error("Failed to read file");
        
        const base64Data = resultRaw.split(',')[1];
        const result = await analyzeResume(base64Data, file.type);
        
        console.log("Analysis Result Received:", result);
        onAnalysisComplete(result);
      } catch (err) {
        console.error("Analysis failed:", err);
        alert("Failed to analyze resume. Please ensure your API key is valid and the file is not corrupted.");
        // Reset analyzing state by completing with null or adding an error handler
        onAnalysisComplete(null);
      }
    };
    reader.onerror = () => {
      alert("Error reading file.");
      onAnalysisComplete(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-xl border border-slate-100 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Analyze Your Resume</h2>
        <p className="text-slate-500 mt-2">Get an AI-powered deep dive into your professional profile.</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
          isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400'
        }`}
        onClick={() => document.getElementById('resume-input')?.click()}
      >
        <input
          type="file"
          id="resume-input"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <div className="space-y-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-slate-700">Drop your resume here</p>
            <p className="text-sm text-slate-400 mt-1">PDF, PNG, JPG supported</p>
          </div>
          <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            Select File
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
