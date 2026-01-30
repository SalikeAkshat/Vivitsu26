
import React, { useEffect, useRef, useState } from 'react';
import { InterviewConfig, InterviewResult, InterviewQuestion } from '../types';
import { generateInterviewQuestions, evaluateFullInterview } from '../services/geminiService';

interface Props {
  config: InterviewConfig;
  onFinish: (result: InterviewResult) => void;
}

const InterviewRoom: React.FC<Props> = ({ config, onFinish }) => {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<'loading' | 'question' | 'recording' | 'reviewing' | 'submitting'>('loading');
  const [answers, setAnswers] = useState<{ question: string, answer: string }[]>([]);
  const [snapshots, setSnapshots] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  // Initialize questions and camera
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        const qs = await generateInterviewQuestions(config.domain, config.difficulty, config.questionCount);
        if (mounted) {
          setQuestions(qs);
          setStatus('question');
        }
      } catch (err) {
        console.error(err);
        alert("Camera and Microphone access are required for the interview.");
      }
    };
    init();
    
    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [config]);

  const captureSnapshot = () => {
    if (canvasRef.current && videoRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0, 320, 240);
      const base64 = canvasRef.current.toDataURL('image/jpeg', 0.6).split(',')[1];
      setSnapshots(prev => [...prev, base64]);
    }
  };

  const startRecording = async () => {
    if (!streamRef.current) {
      alert("Media stream not available. Please check your camera/microphone permissions.");
      return;
    }

    chunksRef.current = [];
    setRecordedAudioUrl(null);
    
    try {
      const recorder = new MediaRecorder(streamRef.current);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedAudioUrl(URL.createObjectURL(blob));
        setStatus('reviewing');
      };
      
      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus('recording');

      // Periodic snapshots for expression analysis during recording
      const interval = setInterval(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          captureSnapshot();
        } else {
          clearInterval(interval);
        }
      }, 3000);
    } catch (err) {
      console.error("Failed to start recording:", err);
      alert("Failed to start recording. Please try again.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const submitAnswer = async () => {
    setStatus('submitting');
    
    const newAnswers = [
      ...answers, 
      { 
        question: questions[currentIndex].text, 
        answer: "User provided a spoken response." 
      }
    ];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setRecordedAudioUrl(null);
      setStatus('question');
    } else {
      try {
        const result = await evaluateFullInterview(config.domain, newAnswers, snapshots);
        onFinish(result);
      } catch (err) {
        console.error("Evaluation failed:", err);
        alert("Failed to evaluate interview. Please check your connection.");
        setStatus('reviewing');
      }
    }
  };

  const reAttempt = () => {
    setRecordedAudioUrl(null);
    setStatus('question');
  };

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center text-white z-50">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xl font-medium">Preparing your custom interview questions...</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col text-white overflow-hidden">
      {/* Top Progress Bar */}
      <div className="h-1 bg-slate-800 w-full">
        <div 
          className="h-full bg-indigo-500 transition-all duration-500" 
          style={{ width: `${((currentIndex + 1) / (questions.length || 1)) * 100}%` }} 
        />
      </div>

      <header className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-bold text-indigo-400">Mock Interview: {config.domain}</h2>
          <p className="text-slate-400 text-sm">Question {currentIndex + 1} of {questions.length}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-bold uppercase tracking-widest text-slate-400">
            {config.difficulty} Mode
          </span>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-5 h-[calc(100vh-84px)]">
        {/* Left: Video & Controls */}
        <div className="lg:col-span-3 p-8 flex flex-col bg-slate-900/20">
          <div className="relative flex-1 rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl group">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" width="320" height="240" />
            
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
              <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <div className={`w-3 h-3 rounded-full ${status === 'recording' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="text-xs font-bold uppercase tracking-widest text-white">
                  {status === 'recording' ? 'Recording Answer' : 'Camera Active'}
                </span>
              </div>
            </div>

            {/* Recording Overlay */}
            {status === 'recording' && (
              <div className="absolute inset-0 border-4 border-rose-500/50 pointer-events-none animate-pulse" />
            )}
          </div>

          <div className="mt-8 flex justify-center gap-4">
            {status === 'question' && (
              <button 
                onClick={startRecording}
                className="group flex items-center gap-3 px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xl transition-all shadow-xl hover:-translate-y-1"
              >
                <div className="w-4 h-4 bg-white rounded-full group-hover:scale-125 transition-transform" />
                Start My Answer
              </button>
            )}

            {status === 'recording' && (
              <button 
                onClick={stopRecording}
                className="flex items-center gap-3 px-10 py-5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-xl transition-all shadow-xl"
              >
                <div className="w-4 h-4 bg-white rounded-sm" />
                Stop Recording
              </button>
            )}

            {status === 'reviewing' && (
              <div className="flex gap-4">
                <button 
                  onClick={reAttempt}
                  className="px-8 py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-xl transition-all border border-white/10"
                >
                  Re-attempt
                </button>
                <button 
                  onClick={submitAnswer}
                  className="px-10 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xl transition-all shadow-xl hover:-translate-y-1"
                >
                  Submit Answer
                </button>
              </div>
            )}

            {status === 'submitting' && (
              <button disabled className="px-10 py-5 bg-slate-700 text-slate-400 rounded-2xl font-bold text-xl cursor-not-allowed flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                Processing...
              </button>
            )}
          </div>
        </div>

        {/* Right: Question Panel */}
        <div className="lg:col-span-2 p-10 bg-slate-900 border-l border-white/5 flex flex-col justify-center">
          {currentQ && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <span className="text-indigo-400 font-bold uppercase tracking-widest text-sm bg-indigo-400/10 px-3 py-1 rounded-md">
                  {currentQ.type} Question
                </span>
                <h1 className="text-4xl font-extrabold text-white leading-tight">
                  {currentQ.text}
                </h1>
              </div>

              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-slate-400 text-sm leading-relaxed">
                  Take a moment to gather your thoughts. When you're ready, click the button to record your response. We recommend answers between 30-90 seconds.
                </p>
              </div>

              {recordedAudioUrl && status === 'reviewing' && (
                <div className="p-6 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                  <p className="text-indigo-400 font-bold text-sm mb-3">Review your recording:</p>
                  <audio src={recordedAudioUrl} controls className="w-full h-10" />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InterviewRoom;
