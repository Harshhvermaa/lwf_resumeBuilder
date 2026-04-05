import { useEffect, useState } from 'react';
import { Sparkles, FileText, Brain, Zap, CheckCircle2 } from 'lucide-react';

interface AILoadingAnimationProps {
  onComplete?: () => void;
}

const steps = [
  { icon: Brain, text: 'Analyzing job description with AI', duration: 2000 },
  { icon: Sparkles, text: 'Extracting key requirements', duration: 1800 },
  { icon: Zap, text: 'Optimizing for ATS systems', duration: 1500 },
  { icon: FileText, text: 'Building your perfect resume', duration: 1700 },
];

export default function AILoadingAnimation({ onComplete }: AILoadingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (currentStep >= steps.length) {
      setTimeout(() => {
        onComplete?.();
      }, 500);
      return;
    }

    const timer = setTimeout(() => {
      setCompletedSteps((prev) => [...prev, currentStep]);
      setCurrentStep((prev) => prev + 1);
    }, steps[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/20 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-2xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-3xl mb-6 shadow-2xl shadow-blue-500/50 animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-black text-white mb-3">
            AI is Creating Your Resume
          </h2>
          <p className="text-slate-400 text-lg">
            Hang tight while we work our magic
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = completedSteps.includes(index);
            const isPending = index > currentStep;

            return (
              <div
                key={index}
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-500 ${
                  isActive
                    ? 'bg-slate-800/50 border-blue-500 scale-105 shadow-xl shadow-blue-500/20'
                    : isCompleted
                    ? 'bg-slate-800/30 border-emerald-500/50'
                    : 'bg-slate-900/30 border-slate-700/50'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                    isActive
                      ? 'bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg shadow-blue-500/50 animate-pulse'
                      : isCompleted
                      ? 'bg-gradient-to-br from-emerald-600 to-emerald-500'
                      : 'bg-slate-800 border border-slate-700'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : (
                    <Icon className={`w-6 h-6 ${isPending ? 'text-slate-600' : 'text-white'}`} />
                  )}
                </div>

                <div className="flex-1">
                  <p
                    className={`font-semibold transition-colors duration-500 ${
                      isActive
                        ? 'text-white'
                        : isCompleted
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.text}
                  </p>
                </div>

                {isActive && (
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                )}

                {isCompleted && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl backdrop-blur-sm">
          <p className="text-sm text-blue-300 text-center">
            Our AI is analyzing thousands of successful resumes to create yours
          </p>
        </div>

        <div className="mt-6 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-emerald-600 transition-all duration-300 ease-out"
            style={{ width: `${((currentStep) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
