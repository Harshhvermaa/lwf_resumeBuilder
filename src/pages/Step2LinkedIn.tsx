import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle2, Linkedin, Loader2, Sparkles, Upload } from 'lucide-react';
import StepProgress from '../components/StepProgress';
import { extractResumeDataFromText, extractTextFromPdf } from '../lib/resumeExtraction';
import { extractResumeWithAI } from '../lib/resumeAi';

const extractionSteps = [
  { label: 'Parsing LinkedIn sections', detail: 'Headline, About, Experience, Education' },
  { label: 'Mapping contact details', detail: 'Name, email, phone, and location' },
  { label: 'Structuring experience', detail: 'Roles, companies, and achievements' },
  { label: 'Organizing skills', detail: 'Grouping keywords for ATS-ready skills' },
];

export default function Step2LinkedIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const jobDescription = (location.state as any)?.jobDescription || '';

  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [activeExtractionStep, setActiveExtractionStep] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const previewPoints = useMemo(
    () => [
      'Profile summary detected',
      'Experience and dates mapped',
      'Education entries cleaned',
      'Skills grouped and deduplicated',
    ],
    []
  );

  useEffect(() => {
    if (!uploading) {
      setActiveExtractionStep(0);
      return;
    }

    const stepTimer = window.setInterval(() => {
      setActiveExtractionStep((prev) => (prev + 1) % extractionSteps.length);
    }, 1500);

    return () => {
      window.clearInterval(stepTimer);
    };
  }, [uploading]);

  const validateAndSetFile = (selectedFile?: File | null) => {
    if (!selectedFile) return;

    const isPdf =
      selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      setErrorMessage('Please upload a valid PDF file');
      setWarningMessage('');
      setFile(null);
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMessage('Please upload a PDF smaller than 10MB.');
      setWarningMessage('');
      setFile(null);
      return;
    }

    setErrorMessage('');
    setWarningMessage('');
    setFile(selectedFile);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async () => {
    if (!linkedinUrl.trim() || !file) {
      setErrorMessage('Please add your LinkedIn URL and upload your LinkedIn PDF');
      return;
    }

    setUploading(true);
    setErrorMessage('');
    setWarningMessage('');

    try {
      const rawText = await extractTextFromPdf(file);
      const sourceText = `LinkedIn URL: ${linkedinUrl}\n\n${rawText}`;

      let resolvedResumeData;

      try {
        const extractedResumeData = await extractResumeWithAI(sourceText, jobDescription);
        resolvedResumeData = {
          ...extractedResumeData,
          extractionStatus: extractedResumeData.extractionStatus || 'success',
          extractionError: extractedResumeData.extractionError || '',
          extractionSource: 'upload',
        };
      } catch (aiError) {
        console.error('AI resume extraction failed, using fallback extraction:', aiError);
        const fallback = extractResumeDataFromText(sourceText, jobDescription);
        resolvedResumeData = {
          ...fallback.resumeData,
          extractionStatus: fallback.score >= 7 ? 'success' as const : 'partial' as const,
          extractionError:
            fallback.score >= 7
              ? ''
              : 'AI extraction is temporarily unavailable, so we used basic parsing. Please review the details carefully.',
          extractionSource: 'upload',
        };
        if (fallback.score < 7) {
          setWarningMessage(
            'AI extraction is temporarily unavailable. We used basic parsing so you can still continue.'
          );
        }
      }

      const resolvedScore = [
        resolvedResumeData.name,
        resolvedResumeData.email,
        resolvedResumeData.phone,
        resolvedResumeData.location,
        resolvedResumeData.summary,
        resolvedResumeData.skills?.some((skill) => skill.trim()) ? 'skills' : '',
        resolvedResumeData.experience?.some((item) => item.title || item.company || item.description) ? 'experience' : '',
        resolvedResumeData.education?.some((item) => item.degree || item.school) ? 'education' : '',
      ].filter(Boolean).length;

      if (resolvedScore < 4) {
        setErrorMessage(
          "We couldn't extract enough details from your LinkedIn content. Please upload a more complete PDF or build from scratch."
        );
        return;
      }

      navigate('/step3', {
        state: {
          resumeData: resolvedResumeData,
        },
      });
    } catch (error) {
      console.error('LinkedIn extraction failed:', error);
      setErrorMessage(
        "We couldn't parse that LinkedIn content. Please retry or continue from scratch."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/step1', { state: { jobDescription } })}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <span className="text-lg font-semibold text-slate-900">JobOnlink</span>
        </div>
      </nav>

      <StepProgress currentStep={2} />

      <div className="max-w-3xl mx-auto px-6 pb-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs font-semibold text-blue-700 mb-6">
            <Linkedin className="w-3.5 h-3.5" />
            LinkedIn Import
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Build Resume from LinkedIn
          </h1>
          <p className="text-lg text-slate-600">
            Upload your LinkedIn PDF and profile link to generate an ATS-optimized resume automatically.
          </p>
        </div>


        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 space-y-6">
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">
              LinkedIn Profile URL <span className="text-red-500">*</span>
            </label>
            <input
              value={linkedinUrl}
              onChange={e => setLinkedinUrl(e.target.value)}
              placeholder="https://www.linkedin.com/in/yourname"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">
              Upload LinkedIn PDF <span className="text-red-500">*</span>
            </label>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
              className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all cursor-pointer px-6 py-10 text-center ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:border-blue-400'
              }`}
              style={{ minHeight: 140 }}
            >
              {!file ? (
                <>
                  <Upload className="h-8 w-8 text-blue-500 mb-2" />
                  <div className="font-semibold text-slate-800 mb-1">Drag & drop your LinkedIn PDF here</div>
                  <div className="text-xs text-slate-500 mb-1">or click to browse</div>
                  <div className="text-xs text-slate-400">PDF only</div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    style={{ display: 'none' }}
                    onChange={e => validateAndSetFile(e.target.files?.[0])}
                  />
                </>
              ) : (
                <div className="flex items-center gap-3 w-full justify-center">
                  <Upload className="h-5 w-5 text-blue-600" />
                  <span className="truncate max-w-[180px] text-sm text-slate-800">{file.name}</span>
                  <span className="ml-2 text-green-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Uploaded</span>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setFile(null); }}
                    className="ml-auto text-xs text-slate-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              We extract your experience, education, and skills directly from your LinkedIn export.
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {warningMessage && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 flex gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5" />
              <span>{warningMessage}</span>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={uploading || !linkedinUrl.trim() || !file}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing LinkedIn profile...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Build Resume from LinkedIn
              </>
            )}
          </button>
        </div>

        {uploading && (
          <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{extractionSteps[activeExtractionStep].label}</p>
                <p className="text-sm text-slate-600">{extractionSteps[activeExtractionStep].detail}</p>
              </div>
            </div>

            <div className="mt-4 grid sm:grid-cols-2 gap-3 text-xs text-slate-600">
              {previewPoints.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
