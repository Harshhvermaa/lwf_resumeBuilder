import { useState } from 'react';
import { X, Target } from 'lucide-react';

interface JobDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobDescription: string) => void;
  onSkip: () => void;
}

export default function JobDescriptionModal({ isOpen, onClose, onSubmit, onSkip }: JobDescriptionModalProps) {
  const [jobDescription, setJobDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (jobDescription.trim()) {
      onSubmit(jobDescription);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Your resume works best when tailored to a job
            </h2>
          </div>
        </div>

        <p className="text-slate-600 mb-6 leading-relaxed">
          Paste a job description so we can optimize your resume for that specific role. Our AI will match your experience to the job requirements and highlight the most relevant skills.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here...

Example:
We are looking for a Senior Software Engineer with 5+ years of experience in React, TypeScript, and Node.js..."
            className="w-full h-64 px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!jobDescription.trim()}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue with Job Description
          </button>
          <button
            onClick={onSkip}
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium"
          >
            Skip for Now
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-4 text-center">
          You can always add or change the job description later
        </p>
      </div>
    </div>
  );
}
