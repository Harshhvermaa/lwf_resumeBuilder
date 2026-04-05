import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertTriangle, Eye, Zap } from 'lucide-react';
import StepProgress from '../components/StepProgress';
import ResumeTemplate from '../components/ResumeTemplate';
import JobContextBanner from '../components/JobContextBanner';
import { getJobDescription, normalizeResumeData } from '../lib/resumeData';
import AILoadingAnimation from '../components/AILoadingAnimation';
import { ROUTES } from '../lib/routes';
import { usePageMeta } from '../lib/usePageMeta';
import {
  tailorResumeWithAI,
  generateSummaryFromContext,
  improveExperienceWithAI,
  generateSummaryFallback,
  generateExperienceFallback,
} from '../lib/resumeAi';

const templates = [
  {
    id: 'ats-clean',
    name: 'ATS Clean',
    description: 'Minimal single-column format optimized for ATS parsing',
    category: 'Professional',
    bestFor: 'Tech & Corporate'
  },
  {
    id: 'spotlight',
    name: 'Spotlight',
    description: 'Featured photo with elegant split layout',
    category: 'Creative',
    bestFor: 'Marketing & Writing'
  },
  {
    id: 'modern',
    name: 'Professional Modern',
    description: 'Clean two-column with better spacing and visual hierarchy',
    category: 'Professional',
    bestFor: 'All Industries'
  },
  {
    id: 'classic-band',
    name: 'Classic Band',
    description: 'Photo header with signature contact band',
    category: 'Creative',
    bestFor: 'Leadership Roles'
  },
  {
    id: 'executive',
    name: 'Compact Executive',
    description: 'Dense information display for experienced professionals',
    category: 'Executive',
    bestFor: 'Senior Roles'
  },
  {
    id: 'portrait-sidebar',
    name: 'Portrait Sidebar',
    description: 'Photo sidebar layout with elegant sections',
    category: 'Creative',
    bestFor: 'Design & UX'
  },
  {
    id: 'dubai',
    name: 'Dubai Standard',
    description: 'Formal style preferred in Middle East markets',
    category: 'Regional',
    bestFor: 'Middle East'
  },
  {
    id: 'creative-designer',
    name: 'Creative Designer',
    description: 'Bold creative layout with photo and accent colors',
    category: 'Creative',
    bestFor: 'Design & Media'
  },
  {
    id: 'europe',
    name: 'Europe Standard',
    description: 'GDPR-compliant minimal format for European markets',
    category: 'Regional',
    bestFor: 'Europe'
  },
  {
    id: 'split-accent',
    name: 'Split Accent',
    description: 'Sidebar layout with warm accents and clear sections',
    category: 'Creative',
    bestFor: 'Marketing & Writing'
  },
  {
    id: 'canada',
    name: 'Canada Standard',
    description: 'Achievement-oriented format popular in North America',
    category: 'Regional',
    bestFor: 'North America'
  },
  {
    id: 'teal-band',
    name: 'Teal Band',
    description: 'Header photo with teal band and two-column layout',
    category: 'Creative',
    bestFor: 'Creative Roles'
  },
];

const sampleResumeData = normalizeResumeData({
  job_description: '',
  jobDescription: '',
  name: 'Sarah Chen',
  email: 'sarah.chen@email.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  summary:
    'Results-driven Software Engineer with 6+ years of experience building scalable web applications. Proven record of shipping high-impact features, improving performance, and collaborating across product and design teams.',
  skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'REST APIs', 'Git', 'CI/CD'],
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'NovaTech',
      location: 'San Francisco, CA',
      startDate: '2021-03',
      endDate: 'Present',
      current: true,
      description:
        'Led development of a customer portal serving 500K+ users, improving load time by 35%. Collaborated with cross-functional teams to deliver 12+ major features on schedule.',
    },
    {
      title: 'Software Engineer',
      company: 'PixelWorks',
      location: 'Remote',
      startDate: '2018-06',
      endDate: '2021-02',
      current: false,
      description:
        'Built React and Node.js services for a B2B SaaS platform, increasing customer retention by 18%. Implemented automated testing that reduced regressions by 25%.',
    },
  ],
  education: [
    {
      school: 'University of California, Berkeley',
      degree: 'B.S. Computer Science',
      location: 'Berkeley, CA',
      graduationDate: '2018',
      gpa: '3.7',
    },
  ],
  projects: [
    {
      name: 'Open Source Contributor',
      description: 'Maintainer of a React component library with 1,200+ stars.',
      technologies: ['React', 'TypeScript', 'Storybook'],
      link: '',
    },
  ],
  certifications: [
    {
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2022',
    },
  ],
});

export default function Step3() {
  usePageMeta({
    title: 'Choose Template',
    description: 'Select the resume template you want to use for your JobOnlink resume.',
    canonicalPath: ROUTES.step3,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const resumeData = normalizeResumeData((location.state as any)?.resumeData || {});
  const [currentResumeData] = useState(resumeData);
  const [selectedTemplate, setSelectedTemplate] = useState(resumeData.template_id || 'modern');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const previewScale = 0.33;
  const [enhancing, setEnhancing] = useState(false);
  const [generationError, setGenerationError] = useState('');

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleContinue = () => {
    const enhance = async () => {
      setEnhancing(true);
      setGenerationError('');

      try {
        const nextResumeData = normalizeResumeData({
          ...currentResumeData,
          template_id: selectedTemplate,
        });
        const jobDescription = getJobDescription(nextResumeData);
        const baseSkillSet = new Set(
          (nextResumeData.skills || []).map((skill) => skill.toLowerCase().trim()).filter(Boolean)
        );

        let tailoredResume = nextResumeData;
        try {
          tailoredResume = await tailorResumeWithAI(nextResumeData, jobDescription);
        } catch (error) {
          console.error('AI tailoring failed:', error);
        }

        const supportText = [
          nextResumeData.summary,
          ...(nextResumeData.experience || []).map((item) => `${item.title} ${item.company} ${item.description} ${item.location}`),
          ...(nextResumeData.education || []).map((item) => `${item.degree} ${item.school} ${item.location}`),
          ...(nextResumeData.projects || []).map((item) => `${item.name} ${item.description} ${(item.technologies || []).join(' ')}`),
          ...(nextResumeData.certifications || []).map((item) => `${item.name} ${item.issuer}`),
          ...(nextResumeData.skills || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const filteredSkills = (tailoredResume.skills || []).filter((skill) => {
          const key = skill.toLowerCase().trim();
          if (!key) return false;
          return baseSkillSet.has(key) || supportText.includes(key);
        });

        let verifiedSummary = '';
        try {
          verifiedSummary = await generateSummaryFromContext(
            tailoredResume,
            jobDescription
              ? 'Verify relevance to the job description and tighten to 3-4 lines. Remove filler and repetition.'
              : 'Improve the summary based on the candidate background. Keep it concise (2-4 lines) and recruiter-friendly.',
            jobDescription
          );
        } catch (error) {
          console.error('AI summary verification failed:', error);
        }

        if (!verifiedSummary && jobDescription) {
          verifiedSummary = generateSummaryFallback(tailoredResume, jobDescription);
        }

        const verifiedExperience = await Promise.all(
          (tailoredResume.experience || []).map(async (exp, index) => {
            if (index > 2) return exp;
            try {
              const improved = await improveExperienceWithAI(
                tailoredResume,
                index,
                jobDescription,
                jobDescription
                  ? 'Verify relevance to the job description. Use 2-3 concise bullets with strong action verbs.'
                  : 'Improve clarity and impact. Use 2-3 concise bullets with strong action verbs.'
              );
              return { ...exp, description: improved };
            } catch (error) {
              return exp;
            }
          })
        );

        const fallbackExperience = (tailoredResume.experience || []).map((exp, index) => {
          const wordCount = (exp.description || '').trim().split(/\s+/).filter(Boolean).length;
          if (wordCount >= 12) return exp;
          return {
            ...exp,
            description: generateExperienceFallback(tailoredResume, index, jobDescription, exp.description || ''),
          };
        });

        const aiAddedSkills = filteredSkills
          .filter((skill) => {
            const key = skill.toLowerCase().trim();
            return key && !baseSkillSet.has(key);
          });

        const finalResumeData = {
          ...tailoredResume,
          skills: filteredSkills.length > 0 ? filteredSkills : tailoredResume.skills,
          summary: verifiedSummary || tailoredResume.summary,
          experience: verifiedExperience.length > 0 ? verifiedExperience : fallbackExperience,
          aiMeta: {
            summaryEnhanced: Boolean(verifiedSummary),
            skillsAdded: aiAddedSkills,
            experienceEnhanced: (verifiedExperience.length > 0 ? verifiedExperience : fallbackExperience).map((_, index) => index),
          },
          template_id: selectedTemplate,
        };

        navigate(ROUTES.step4, {
          state: {
            resumeData: finalResumeData,
          },
        });
      } catch (error) {
        console.error('Failed to enhance resume:', error);
        setGenerationError('We could not enhance your resume right now. Please try again.');
        setEnhancing(false);
      }
    };

    void enhance();
  };

  if (enhancing) {
    return <AILoadingAnimation />;
  }

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

      <JobContextBanner jobDescription={getJobDescription(currentResumeData)} />

      <StepProgress currentStep={3} />

      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Choose Your Template
          </h1>
          <p className="text-lg text-slate-600">
            Select a template that best fits your industry and style
          </p>
          {getJobDescription(currentResumeData) && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-sm font-medium mt-4 text-blue-700">
              <CheckCircle2 className="w-4 h-4" />
              Optimized for your job
            </div>
          )}
        </div>

        {generationError ? (
          <div className="max-w-5xl mx-auto mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-rose-900">Resume enhancement failed</p>
                <p className="text-sm text-rose-800 mt-1">{generationError}</p>
              </div>
            </div>
          </div>
        ) : currentResumeData.extractionStatus === 'partial' && currentResumeData.extractionError ? (
          <div className="max-w-5xl mx-auto mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-900">Some resume details need review</p>
                <p className="text-sm text-amber-800 mt-1">{currentResumeData.extractionError}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`group relative bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                  selectedTemplate === template.id
                    ? 'border-blue-600 shadow-xl'
                    : 'border-slate-200 hover:border-blue-500 hover:shadow-xl'
                }`}
                onClick={() => handleTemplateSelect(template.id)}
                onMouseEnter={() => setHoveredTemplate(template.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
              >
                <div className="px-4 py-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{template.name}</h3>
                      <p className="text-sm text-slate-500">{template.category}</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      ATS
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                    {template.description}
                  </p>

                  <div className="text-xs text-slate-500 mb-4">
                    <span className="font-medium">Best for:</span> {template.bestFor}
                  </div>

                  <div className="relative mb-4 h-80 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <div
                      className="pointer-events-none absolute top-2 left-1/2"
                      style={{
                        width: '794px',
                        height: '1123px',
                        transform: `translateX(-50%) scale(${previewScale})`,
                        transformOrigin: 'top center',
                      }}
                    >
                      <ResumeTemplate
                        data={{
                          ...sampleResumeData,
                          template_id: template.id,
                        }}
                        scale={1}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                        selectedTemplate === template.id || hoveredTemplate === template.id
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      Use Template
                    </button>
                    <button
                      onClick={() => setPreviewTemplate(template.id)}
                      className="px-4 py-3 border-2 border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all"
                      title="Preview Template"
                    >
                      <Eye className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="h-20" />
        </div>
      </div>

      <div className="sticky bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Selected template</p>
            <p className="text-xs text-slate-500">
              {templates.find((template) => template.id === selectedTemplate)?.name}
            </p>
          </div>
          <button
            onClick={handleContinue}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Continue to Confirm Details
          </button>
        </div>
      </div>

      {previewTemplate && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
          onClick={() => setPreviewTemplate(null)}
        >
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {templates.find(t => t.id === previewTemplate)?.name}
              </h2>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition-all"
              >
                Close
              </button>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <ResumeTemplate
                data={{ ...sampleResumeData, template_id: previewTemplate }}
              />
            </div>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => {
                  setPreviewTemplate(null);
                  handleTemplateSelect(previewTemplate);
                }}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
