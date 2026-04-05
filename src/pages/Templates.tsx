import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, CheckCircle2, Eye, Zap } from 'lucide-react';
import ResumeTemplate from '../components/ResumeTemplate';
import JobDescriptionModal from '../components/JobDescriptionModal';
import { useAuth } from '../contexts/AuthContext';
import { normalizeResumeData } from '../lib/resumeData';
import { ROUTES } from '../lib/routes';
import { usePageMeta } from '../lib/usePageMeta';

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
  summary: 'Results-driven Senior Software Engineer with 7+ years of experience building scalable web applications. Proven track record of leading cross-functional teams and delivering high-impact features that drive business growth.',
  profile_image: '',
  skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'GraphQL', 'REST APIs', 'Git', 'CI/CD'],
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'TechCorp Solutions',
      location: 'San Francisco, CA',
      startDate: '2021-03',
      endDate: 'Present',
      current: true,
      description: 'Led development of customer-facing products serving 2M+ users, resulting in 40% increase in user engagement and 25% revenue growth. Architected microservices infrastructure, mentored a team of 5 engineers, and delivered 15+ major features on schedule.',
    },
    {
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      location: 'Remote',
      startDate: '2019-01',
      endDate: '2021-02',
      current: false,
      description: 'Developed core platform features for a B2B SaaS product, built responsive React and Node.js applications for 50K+ monthly users, and improved API performance through database optimization and caching.',
    },
    {
      title: 'Junior Software Developer',
      company: 'Digital Innovations Inc',
      location: 'New York, NY',
      startDate: '2017-06',
      endDate: '2018-12',
      current: false,
      description: 'Contributed to enterprise web applications for Fortune 500 clients, maintained REST APIs with Node.js and Express, and built reusable React components that improved development efficiency.',
    }
  ],
  education: [
    {
      school: 'University of California, Berkeley',
      degree: 'Bachelor of Science in Computer Science',
      location: 'Berkeley, CA',
      graduationDate: '2017',
      gpa: '3.8'
    }
  ],
  projects: [
    {
      name: 'Open Source Contributor',
      description: 'Active contributor to popular React libraries with 500+ GitHub stars',
      technologies: ['React', 'TypeScript', 'Jest'],
      link: 'github.com/username'
    }
  ],
  certifications: [
    {
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2022'
    }
  ]
});

const previewScale = 0.4; // Scale down the template preview for better fit

export default function Templates() {
  usePageMeta({
    title: 'Resume Templates',
    description: 'Browse ATS-friendly resume templates designed for modern job applications on JobOnlink.',
    canonicalPath: ROUTES.templates,
  });

  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    if (!user) {
      navigate(ROUTES.login, { state: { from: ROUTES.templates, templateId } });
      return;
    }
    setSelectedTemplate(templateId);
    setShowJobModal(true);
  };

  const handleJobDescriptionSubmit = (jobDescription: string) => {
    navigate(ROUTES.step2Scratch, {
      state: {
        jobDescription,
        templateId: selectedTemplate,
      }
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(ROUTES.home)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back to Home</span>
          </button>
          {!user && (
            <button
              onClick={() => navigate(ROUTES.login)}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs font-semibold text-blue-700 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            13 Professional Templates
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
            Choose Your Template
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            All templates are ATS-optimized and designed to get you hired
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {templates.map((template) => (
            <div
              key={template.id}
              className="group relative bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300"
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
                      data={{ ...sampleResumeData, template_id: template.id }}
                      scale={1}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      hoveredTemplate === template.id
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

        <div className="text-center bg-slate-50 rounded-2xl p-8 border border-slate-200">
          <p className="text-slate-600">
            All templates include <span className="text-blue-600 font-semibold">ATS optimization</span>,
            <span className="text-green-600 font-semibold"> professional formatting</span>, and
            <span className="text-purple-600 font-semibold"> customizable sections</span>
          </p>
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

      <JobDescriptionModal
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
        onSubmit={handleJobDescriptionSubmit}
        onSkip={() => handleJobDescriptionSubmit('')}
      />
    </div>
  );
}
