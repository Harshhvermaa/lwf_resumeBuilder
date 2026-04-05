import { Target } from 'lucide-react';

interface JobContextBannerProps {
  jobDescription: string;
}

export default function JobContextBanner({ jobDescription }: JobContextBannerProps) {
  if (!jobDescription) return null;

  const extractJobTitle = (jd: string) => {
    const lines = jd.split('\n');
    const firstLine = lines[0] || '';
    if (firstLine.length > 60) {
      return firstLine.substring(0, 60) + '...';
    }
    return firstLine || 'Your target job';
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 py-3">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-center gap-2 text-sm">
          <Target className="w-4 h-4 text-blue-600" />
          <span className="text-slate-700">
            <span className="font-medium text-blue-700">Resume optimized for:</span>{' '}
            {extractJobTitle(jobDescription)}
          </span>
        </div>
      </div>
    </div>
  );
}
