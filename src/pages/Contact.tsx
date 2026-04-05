import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { ROUTES } from '../lib/routes';
import { usePageMeta } from '../lib/usePageMeta';

export default function Contact() {
  const navigate = useNavigate();

  usePageMeta({
    title: 'Contact',
    description: 'Contact JobOnlink for support, product questions, and resume builder assistance.',
    canonicalPath: ROUTES.contact,
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
        <h1 className="text-4xl font-bold text-slate-900">Contact JobOnlink</h1>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
          <p>If you need help with resume generation, account access, or saved resumes, reach out to our team.</p>
          <a href="mailto:support@jobonlink.com" className="mt-4 inline-flex items-center gap-2 font-semibold text-blue-600">
            <Mail className="h-4 w-4" />
            support@jobonlink.com
          </a>
        </div>
      </div>
    </div>
  );
}
