import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, CheckCircle2, Save } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import ResumeTemplate from '../components/ResumeTemplate';
import StepProgress from '../components/StepProgress';
import {
  getJobDescription,
  isMissingProfileImageColumnError,
  normalizeResumeData,
  toResumeInsertPayload,
  withoutProfileImage,
} from '../lib/resumeData';
import { compactResumeData } from '../components/templates/templateUtils';
import { getDescriptionPoints } from '../components/templates/templateUtils';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ROUTES } from '../lib/routes';
import { usePageMeta } from '../lib/usePageMeta';

export default function Step5() {
  usePageMeta({
    title: 'Preview and Download',
    description: 'Preview your final resume, save it, and download it as PDF or DOCX from JobOnlink.',
    canonicalPath: ROUTES.step5,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const resumeData = normalizeResumeData((location.state as any)?.resumeData || {});
  const resumeRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [compactLevel, setCompactLevel] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  const previewScale = 0.45;
  const pageHeight = 1123;
  const pageWidth = 794;

  const renderData = useMemo(
    () => compactResumeData(resumeData, compactLevel),
    [resumeData, compactLevel]
  );

  useEffect(() => {
    if (!measureRef.current) return;
    const height = measureRef.current.scrollHeight || measureRef.current.clientHeight;
    const overflow = height - pageHeight;

    const items = Array.from(measureRef.current.querySelectorAll<HTMLElement>('.resume-item'));
    const sections = Array.from(measureRef.current.querySelectorAll<HTMLElement>('.resume-section'));
    const hasCrossing = [...items, ...sections].some((el) => {
      const top = el.offsetTop;
      const bottom = top + el.offsetHeight;
      return top < pageHeight && bottom > pageHeight;
    });

    if (overflow > 0 && compactLevel < 4) {
      setCompactLevel((prev) => prev + 1);
      return;
    }

    if (hasCrossing && compactLevel < 4) {
      setCompactLevel((prev) => prev + 1);
      return;
    }
  }, [renderData, compactLevel]);

  const previewPages = useMemo(() => [0], []);

  const handleBackToConfirm = () => {
    navigate(ROUTES.step4, { state: { resumeData }, replace: true });
  };

  const handleDownloadPDF = async () => {
    if (!resumeRef.current) return;

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const page = resumeRef.current.querySelector<HTMLDivElement>('[data-export-page]');
      if (!page) return;
      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const fileName = `JobOnlink_Resume_${resumeData.name?.replace(/\s+/g, '_') || 'Document'}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      window.print();
    }
  };

  const handleDownloadDOCX = () => {
    const buildDocx = async () => {
      const children: Paragraph[] = [];

      children.push(
        new Paragraph({
          text: resumeData.name || 'Your Name',
          heading: HeadingLevel.TITLE,
        })
      );

      const contactParts = [resumeData.email, resumeData.phone, resumeData.location].filter(Boolean).join(' | ');
      if (contactParts) {
        children.push(new Paragraph({ text: contactParts }));
      }

      if (resumeData.summary?.trim()) {
        children.push(new Paragraph({ text: '' }));
        children.push(new Paragraph({ text: 'Professional Summary', heading: HeadingLevel.HEADING_2 }));
        children.push(new Paragraph({ text: resumeData.summary }));
      }

      if (resumeData.skills?.length) {
        children.push(new Paragraph({ text: '' }));
        children.push(new Paragraph({ text: 'Skills', heading: HeadingLevel.HEADING_2 }));
        children.push(new Paragraph({ text: resumeData.skills.filter(Boolean).join(', ') }));
      }

      if (resumeData.experience?.length) {
        children.push(new Paragraph({ text: '' }));
        children.push(new Paragraph({ text: 'Work Experience', heading: HeadingLevel.HEADING_2 }));
        resumeData.experience.forEach((exp) => {
          const titleLine = [exp.title, exp.company].filter(Boolean).join(' | ');
          if (titleLine) {
            children.push(new Paragraph({ children: [new TextRun({ text: titleLine, bold: true })] }));
          }
          const dateLine = [exp.location, `${exp.startDate}${exp.current ? ' - Present' : exp.endDate ? ` - ${exp.endDate}` : ''}`]
            .filter(Boolean)
            .join(' | ');
          if (dateLine) {
            children.push(new Paragraph({ text: dateLine }));
          }
          const bullets = getDescriptionPoints(exp.description, 3);
          bullets.forEach((point) => {
            children.push(new Paragraph({ text: point, bullet: { level: 0 } }));
          });
        });
      }

      if (resumeData.education?.length) {
        children.push(new Paragraph({ text: '' }));
        children.push(new Paragraph({ text: 'Education', heading: HeadingLevel.HEADING_2 }));
        resumeData.education.forEach((edu) => {
          const eduLine = [edu.degree, edu.school].filter(Boolean).join(' | ');
          if (eduLine) {
            children.push(new Paragraph({ children: [new TextRun({ text: eduLine, bold: true })] }));
          }
          const eduMeta = [edu.location, edu.graduationDate, edu.gpa ? `GPA: ${edu.gpa}` : ''].filter(Boolean).join(' | ');
          if (eduMeta) {
            children.push(new Paragraph({ text: eduMeta }));
          }
        });
      }

      if (resumeData.certifications?.length) {
        children.push(new Paragraph({ text: '' }));
        children.push(new Paragraph({ text: 'Certifications / Courses', heading: HeadingLevel.HEADING_2 }));
        resumeData.certifications.forEach((cert) => {
          const certLine = [cert.name, cert.issuer, cert.date].filter(Boolean).join(' | ');
          if (certLine) {
            children.push(new Paragraph({ text: certLine }));
          }
        });
      }

      if (resumeData.projects?.length) {
        children.push(new Paragraph({ text: '' }));
        children.push(new Paragraph({ text: 'Projects', heading: HeadingLevel.HEADING_2 }));
        resumeData.projects.forEach((project) => {
          const projectLine = project.name || '';
          if (projectLine) {
            children.push(new Paragraph({ children: [new TextRun({ text: projectLine, bold: true })] }));
          }
          if (project.description) {
            children.push(new Paragraph({ text: project.description }));
          }
          const techLine = (project.technologies || []).filter(Boolean).join(', ');
          if (techLine) {
            children.push(new Paragraph({ text: techLine }));
          }
        });
      }

      const doc = new Document({ sections: [{ children }] });
      const blob = await Packer.toBlob(doc);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `JobOnlink_Resume_${resumeData.name?.replace(/\s+/g, '_') || 'Document'}.docx`;
      link.click();
      URL.revokeObjectURL(link.href);
    };

    void buildDocx();
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveMessage('');
    setSaveError('');

    try {
      const payload = toResumeInsertPayload(resumeData, user.id);

      if (resumeData.id) {
        let { error } = await supabase
          .from('resumes')
          .update(payload)
          .eq('id', resumeData.id);

        if (error && isMissingProfileImageColumnError(error)) {
          ({ error } = await supabase
            .from('resumes')
            .update(withoutProfileImage(payload))
            .eq('id', resumeData.id));
        }

        if (error) throw error;
      } else {
        let { data, error } = await supabase
          .from('resumes')
          .insert([payload])
          .select()
          .maybeSingle();

        if (error && isMissingProfileImageColumnError(error)) {
          ({ data, error } = await supabase
            .from('resumes')
            .insert([withoutProfileImage(payload)])
            .select()
            .maybeSingle());
        }

        if (error) throw error;
        void data;
      }

      setSaveMessage('Saved successfully!');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (error) {
      console.error(error);
      setSaveError('Error saving resume');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={handleBackToConfirm}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <span className="text-lg font-semibold text-slate-900">JobOnlink</span>
        </div>
      </nav>

      <StepProgress currentStep={5} />

      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Your Resume is Ready!
          </h1>
          <p className="text-lg text-slate-600 mb-4">
            Download your resume in your preferred format
          </p>
          {getJobDescription(resumeData) && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-sm font-medium text-blue-700">
              <CheckCircle2 className="w-4 h-4" />
              Tailored to your target job
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Download Options</h2>

              <div className="mb-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-between p-6 bg-slate-50 border-2 border-slate-200 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all group shadow-sm hover:shadow-md disabled:opacity-60"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                      <Save className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-slate-900">Save Resume</h3>
                      <p className="text-sm text-slate-600">Store this version in your dashboard</p>
                    </div>
                  </div>
                  <Save className="w-5 h-5 text-slate-600 group-hover:text-slate-700 group-hover:translate-x-1 transition-all" />
                </button>
                {saveMessage && <p className="mt-2 text-sm text-green-600">{saveMessage}</p>}
                {saveError && <p className="mt-2 text-sm text-rose-600">{saveError}</p>}
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleDownloadPDF}
                  className="w-full flex items-center justify-between p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl hover:from-blue-100 hover:to-blue-200 hover:border-blue-400 transition-all group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                      <Download className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-slate-900">Download as PDF</h3>
                      <p className="text-sm text-slate-600">Recommended for most applications</p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-blue-600 group-hover:text-blue-700 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={handleDownloadDOCX}
                  className="w-full flex items-center justify-between p-6 bg-slate-50 border-2 border-slate-200 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                      <Download className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-slate-900">Download as DOCX</h3>
                      <p className="text-sm text-slate-600">Editable Microsoft Word format</p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-slate-600 group-hover:text-slate-700 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                What's next?
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                  <span>Review your resume one more time before applying</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                  <span>Customize your resume for each job application</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                  <span>Keep your resume updated as you gain new skills</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBackToConfirm}
                className="flex-1 px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-medium shadow-sm hover:shadow-md"
              >
                Edit Details
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all font-medium"
              >
                Create New Resume
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Preview</h2>
            <div className="bg-slate-100 rounded-lg p-4 overflow-auto" style={{ maxHeight: '700px' }}>
              <div className="space-y-4">
                {previewPages.map((pageIndex) => (
                  <div
                    key={pageIndex}
                    className="resume-page"
                    style={{
                      height: `${pageHeight * previewScale}px`,
                      width: `${pageWidth * previewScale}px`,
                    }}
                  >
                    <div
                      style={{
                        transform: `translateY(-${pageIndex * pageHeight * previewScale}px)`,
                        transformOrigin: 'top left',
                      }}
                    >
                      <ResumeTemplate data={renderData} scale={previewScale} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed left-[-99999px] top-0 opacity-0 pointer-events-none">
        <div ref={measureRef}>
          <ResumeTemplate data={renderData} scale={1} />
        </div>
      </div>

      <div className="fixed left-[-99999px] top-0 opacity-0 pointer-events-none">
        <div ref={resumeRef}>
          {previewPages.map((pageIndex) => (
            <div
              key={pageIndex}
              data-export-page
              className="resume-page"
              style={{
                height: `${pageHeight}px`,
                width: `${pageWidth}px`,
                marginBottom: 0,
                boxShadow: 'none',
              }}
            >
              <div
                style={{
                  transform: `translateY(-${pageIndex * pageHeight}px)`,
                  transformOrigin: 'top left',
                }}
              >
                <ResumeTemplate data={renderData} scale={1} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
