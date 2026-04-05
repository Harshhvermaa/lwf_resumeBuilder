import { Check } from 'lucide-react';

interface StepProgressProps {
  currentStep: number;
}

const steps = [
  { number: 1, title: 'Job + Basic Info' },
  { number: 2, title: 'Resume Details' },
  { number: 3, title: 'Template' },
  { number: 4, title: 'Confirm Details' },
  { number: 5, title: 'Preview & Download' },
];

export default function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-8">
      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        <div className="relative flex justify-between">
          {steps.map((step) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;

            return (
              <div key={step.number} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isCompleted
                      ? 'bg-blue-600 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-white text-slate-400 border-2 border-slate-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : step.number}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isCurrent ? 'text-blue-600' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
