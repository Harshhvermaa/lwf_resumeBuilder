import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, ArrowLeft, FileText, Loader2, AlertTriangle, CheckCircle2, Sparkles, ScanSearch } from 'lucide-react';
import StepProgress from '../components/StepProgress';
import { extractResumeDataFromText, extractTextFromPdf } from '../lib/resumeExtraction';
import { extractResumeWithAI } from '../lib/resumeAi';

const extractionSteps = [
  { label: 'Scanning resume layout', detail: 'Reading sections and page structure' },
  { label: 'Finding contact details', detail: 'Name, email, phone, and location' },
  { label: 'Understanding experience', detail: 'Work history, summary, and achievements' },
  { label: 'Organizing education and skills', detail: 'Preparing clean resume data for your review' },
];

const extractionPreviewItems = [
  { label: 'Name extracted', value: 'Your full name recognized' },
  { label: 'Contact details found', value: 'Email and phone are being mapped' },
  { label: 'Location found', value: 'City and region are being separated cleanly' },
  { label: 'Summary identified', value: 'Professional introduction is being prepared' },
  { label: 'Skills mapped', value: 'Keywords are grouped into ATS-friendly skills' },
  { label: 'Education separated', value: 'Degrees and schools are being organized' },
];

export default function Step2Upload() {
  const navigate = useNavigate();
  const location = useLocation();
  const jobDescription = (location.state as any)?.jobDescription || '';

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [activeExtractionStep, setActiveExtractionStep] = useState(0);
  const [visiblePreviewCount, setVisiblePreviewCount] = useState(0);

  useEffect(() => {
    if (!uploading) {
      setActiveExtractionStep(0);
      setVisiblePreviewCount(0);
      return;
    }

    const stepTimer = window.setInterval(() => {
      setActiveExtractionStep((prev) => (prev + 1) % extractionSteps.length);
    }, 1500);

    const previewTimer = window.setInterval(() => {
      setVisiblePreviewCount((prev) => (prev < extractionPreviewItems.length ? prev + 1 : prev));
    }, 400);

    return () => {
      window.clearInterval(stepTimer);
      window.clearInterval(previewTimer);
    };
  }, [uploading]);

  const validateAndSetFile = (selectedFile?: File | null) => {
    if (!selectedFile) return;

    const isPdf =
      selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      setErrorMessage('Please upload a PDF resume.');
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndSetFile(e.target.files?.[0]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndSetFile(e.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setErrorMessage('');
    setWarningMessage('');

    try {
      const rawText = await extractTextFromPdf(file);
      let resolvedResumeData;

      try {
        const extractedResumeData = await extractResumeWithAI(rawText, jobDescription);
        resolvedResumeData = {
          ...extractedResumeData,
          extractionStatus: extractedResumeData.extractionStatus || 'success',
          extractionError: extractedResumeData.extractionError || '',
        };
      } catch (aiError) {
        console.error('AI resume extraction failed, using fallback extraction:', aiError);
        const fallback = extractResumeDataFromText(rawText, jobDescription);
        resolvedResumeData = {
          ...fallback.resumeData,
          extractionStatus: fallback.score >= 7 ? 'success' as const : 'partial' as const,
          extractionError:
            fallback.score >= 7
              ? ''
              : 'AI extraction is temporarily unavailable, so we used basic PDF parsing. Please review the details carefully.',
        };
        if (fallback.score < 7) {
          setWarningMessage(
            'AI extraction is temporarily unavailable. We used basic PDF parsing so you can still continue.'
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
          "We couldn't extract enough details from this resume. Please continue from scratch or try a clearer PDF."
        );
        return;
      }

      navigate('/step3', {
        state: {
          resumeData: resolvedResumeData,
        },
      });
    } catch (error) {
      console.error('Resume extraction failed:', error);
      setErrorMessage(
        "We couldn't read this PDF properly. Please retry, try another PDF, or continue from scratch."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleContinueFromScratch = () => {
    navigate('/step2-scratch', { state: { jobDescription } });
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
          <span className="text-lg font-semibold text-slate-900">CVLuck</span>
        </div>
      </nav>

      <StepProgress currentStep={2} />

      <div className="max-w-2xl mx-auto px-6 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Upload Your Resume
          </h1>
          <p className="text-lg text-slate-600">
            Upload your existing resume and we'll extract your information
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          {!file ? (
            <label
              className="block cursor-pointer"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                className={`border-2 border-dashed rounded-xl p-16 text-center transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/50'
                }`}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Drop your PDF here or click to browse
                </h3>
                <p className="text-slate-600">
                  Supports PDF files only (Max 10MB)
                </p>
                <p className="text-sm text-slate-500 mt-3">
                  Drag your resume here or click to choose it
                </p>
              </div>
            </label>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                <FileText className="w-12 h-12 text-blue-600" />
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{file.name}</p>
                  <p className="text-sm text-slate-600">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  disabled={uploading}
                  className="text-sm text-slate-600 hover:text-red-600 font-medium transition-colors disabled:opacity-50"
                >
                  Remove
                </button>
              </div>

              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Extracting information...
                  </>
                ) : (
                  'Continue'
                )}
              </button>

              {uploading && (
                <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-2xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.22),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_36%)]" />
                  <div className="absolute -left-10 top-6 h-28 w-28 rounded-full bg-blue-500/20 blur-3xl" />
                  <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />

                  <div className="relative space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-100">
                          <Sparkles className="h-3.5 w-3.5" />
                          CVLuck AI Extraction
                        </div>
                        <h3 className="mt-3 text-xl font-bold">Preparing your resume details</h3>
                        <p className="mt-1 text-sm text-slate-300">
                          We’re extracting your information so you can confirm everything before we generate the final resume.
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                        <ScanSearch className="h-6 w-6 text-blue-200 animate-pulse" />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-white">{extractionSteps[activeExtractionStep].label}</p>
                          <p className="text-xs text-slate-300">{extractionSteps[activeExtractionStep].detail}</p>
                        </div>
                        <Loader2 className="h-5 w-5 animate-spin text-blue-200" />
                      </div>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-300 transition-all duration-700"
                          style={{ width: `${(Math.max(visiblePreviewCount, 1) / extractionPreviewItems.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {extractionPreviewItems.map((item, index) => {
                        const isVisible = index < visiblePreviewCount;
                        return (
                          <div
                            key={item.label}
                            className={`rounded-2xl border p-4 transition-all duration-700 ${
                              isVisible
                                ? 'animate-blur-rise border-emerald-400/30 bg-white/10 opacity-100'
                                : 'translate-y-5 border-white/5 bg-white/5 opacity-25 blur-[6px]'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl ${
                                  isVisible ? 'bg-emerald-400/20 text-emerald-300' : 'bg-white/10 text-slate-500'
                                }`}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className={`text-sm font-semibold ${isVisible ? 'text-white' : 'text-slate-400'}`}>
                                  {item.label}
                                </p>
                                <p className={`mt-1 text-xs leading-5 ${isVisible ? 'text-blue-100' : 'text-slate-500'}`}>
                                  {item.value}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {warningMessage && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-800">Continuing with basic extraction</p>
                  <p className="text-sm text-amber-700 mt-1">{warningMessage}</p>
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-800">Resume extraction failed</p>
                  <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Retry
                    </button>
                    <button
                      onClick={handleContinueFromScratch}
                      className="inline-flex items-center rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                    >
                      Continue from scratch
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
