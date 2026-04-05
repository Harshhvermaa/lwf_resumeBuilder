import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '../lib/routes';
import { usePageMeta } from '../lib/usePageMeta';

export default function Privacy() {
  const navigate = useNavigate();

  usePageMeta({
    title: 'Privacy Policy',
    description: 'Read the JobOnlink privacy policy to understand how we collect, use, and protect your resume data.',
    canonicalPath: ROUTES.privacy,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <button
          onClick={() => navigate(ROUTES.home)}
          className="mb-8 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
        <h1 className="text-4xl font-bold text-slate-900">Privacy Policy</h1>
        <div className="mt-6 space-y-5 text-slate-600">
          <p>JobOnlink helps you build resumes tailored to real jobs. We only use the information you provide to generate, save, and improve your resume experience.</p>
          <p>Your uploaded resumes, job descriptions, and account information are used to create resume drafts, save progress, and enable downloads. We do not sell your personal data.</p>
          <p>If you want your saved resume data removed, contact us and we will help process that request.</p>
        </div>
      </div>
    </div>
  );
}
