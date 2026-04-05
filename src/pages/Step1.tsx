import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, PenTool, ArrowLeft, Linkedin } from 'lucide-react';
import StepProgress from '../components/StepProgress';

export default function Step1() {
  const navigate = useNavigate();
  const location = useLocation();
  const jobDescription = (location.state as any)?.jobDescription || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <span className="text-lg font-semibold text-slate-900">JobOnlink</span>
        </div>
      </nav>

      <StepProgress currentStep={1} />

      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            How would you like to start?
          </h1>
          <p className="text-lg text-slate-600">
            Choose the best way to build your resume
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/step2-upload', { state: { jobDescription } })}
            className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all text-left group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-200">
              <Upload className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Upload Existing Resume
            </h2>

            <p className="text-slate-600 mb-4 leading-relaxed">
              Have a resume already? Upload it and we'll extract your information and optimize it for the job.
            </p>

            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Auto-fill from your existing resume
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Optimize for the job description
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Save time with automatic extraction
              </li>
            </ul>
          </button>

          <button
            onClick={() => navigate('/step2-linkedin', { state: { jobDescription } })}
            className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all text-left group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-200">
              <Linkedin className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Import from LinkedIn
            </h2>

            <p className="text-slate-600 mb-4 leading-relaxed">
              Upload LinkedIn PDF to generate a clean, ATS-optimized resume.
            </p>

            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Upload your LinkedIn PDF export
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                We extract your experience, education, and skills
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                AI organizes everything into a professional resume
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Review and edit before finalizing
              </li>
            </ul>
          </button>

          <button
            onClick={() => navigate('/step2-scratch', { state: { jobDescription } })}
            className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all text-left group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-200">
              <PenTool className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Build from Scratch
            </h2>

            <p className="text-slate-600 mb-4 leading-relaxed">
              Start fresh and create your resume from the ground up with our guided form.
            </p>

            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Fill in your information step by step
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                AI-powered suggestions
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Perfect for first-time resume builders
              </li>
            </ul>
          </button>
        </div>
      </div>
    </div>
  );
}
