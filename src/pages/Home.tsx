import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Sparkles,
  ScanSearch,
  PenTool,
  ShieldCheck,
  Target,
  Zap,
  XCircle,
  Plus,
  Minus,
  User,
  Briefcase,
  RefreshCw,
  Globe2,
  Users,
} from 'lucide-react';
import ResumeTemplate from '../components/ResumeTemplate';
import { normalizeResumeData } from '../lib/resumeData';
import { useAuth } from '../contexts/AuthContext';
import JobDescriptionModal from '../components/JobDescriptionModal';

type TemplateCard = {
  id: string;
  name: string;
  description: string;
  category: string;
  bestFor: string;
};

const templates: TemplateCard[] = [
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
const previewScale = 0.4;

const aiHighlights = [
  { icon: Sparkles, title: 'Rewrites your summary', desc: 'Role-specific, recruiter-ready, and concise.' },
  { icon: ScanSearch, title: 'Matches skills to job', desc: 'Keeps only relevant, ATS keywords.' },
  { icon: Zap, title: 'Improves experience bullets', desc: 'Action verbs, impact, and clarity.' },
  { icon: ShieldCheck, title: 'Ensures ATS compliance', desc: 'Structure that passes scans consistently.' },
];

const audiences = [
  { icon: User, title: 'Freshers', desc: 'Launch your career with a strong first resume.' },
  { icon: Briefcase, title: 'Professionals', desc: 'Show impact, leadership, and outcomes.' },
  { icon: RefreshCw, title: 'Career Switchers', desc: 'Translate experience to the new role.' },
  // { icon: Globe2, title: 'Dubai Job Seekers', desc: 'Regional formats aligned to GCC hiring.' },
  { icon: Users, title: 'High-volume applicants', desc: 'Apply faster with job-ready resumes.' },
];

const testimonials = [
  {
    name: 'Ritika S.',
    role: 'Marketing Executive',
    quote: 'The resume matched my job description perfectly. I got interviews in a week.',
  },
  {
    name: 'Ankit K.',
    role: 'Data Analyst',
    quote: 'Clean one-page output with strong bullets. Exactly what recruiters want.',
  },
  {
    name: 'Sara M.',
    role: 'HR Associate',
    quote: 'AI picked the right skills and made my experience sound impactful.',
  },
  {
    name: 'Kiran P.',
    role: 'Software Engineer',
    quote: 'It fixed my summary and aligned it to the job. Super fast and professional.',
  },
  {
    name: 'Priya D.',
    role: 'Product Manager',
    quote: 'Loved the templates and the AI suggestions. Landed my dream job!',
  },
  {
    name: 'Mohit V.',
    role: 'Business Analyst',
    quote: 'The process was so easy. My resume finally stands out.',
  },
  {
    name: 'Emily R.',
    role: 'UX Designer',
    quote: 'The creative templates helped me showcase my portfolio beautifully.',
  },
  {
    name: 'Amit S.',
    role: 'Sales Lead',
    quote: 'Got more interview calls after switching to CVLuck!',
  },
  {
    name: 'Fatima Z.',
    role: 'Operations Specialist',
    quote: 'The AI made my experience sound so much more impactful. Highly recommend!',
  },
  {
    name: 'Lucas B.',
    role: 'Graduate',
    quote: 'Perfect for freshers. I got my first job within a month!',
  },
];

const faqs = [
  {
    q: 'Is CVLuck ATS friendly?',
    a: 'Yes. Every resume is structured for ATS parsing with clean, readable formatting.',
  },
  {
    q: 'Can I upload my existing resume?',
    a: 'Yes. Upload a PDF and CVLuck will extract and improve the content.',
  },
  {
    q: 'Can I edit before download?',
    a: 'Absolutely. You review and confirm every detail before generation.',
  },
  {
    q: 'Is it job-description specific?',
    a: 'Yes. The AI optimizes summary, skills, and bullets based on the job description.',
  },
];
export default function Home() {
  const [jobDescription, setJobDescription] = useState('');
  const [showJobModal, setShowJobModal] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [showJDValidation, setShowJDValidation] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showcaseSelected, setShowcaseSelected] = useState<string>(templates[0].id);
  const showcaseRef = useRef<HTMLDivElement | null>(null);

  // Animate cards on mount
  useEffect(() => {
    const showcaseElement = showcaseRef.current;
    if (!showcaseElement) return;

    const cards = Array.from(
      showcaseElement.querySelectorAll('.template-card-anim')
    ) as HTMLElement[];

    cards.forEach((card: HTMLElement, i: number) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(40px) scale(0.96)';
      setTimeout(() => {
        card.style.transition = 'all 0.7s cubic-bezier(.4,2,.3,1)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
      }, 120 + i * 120);
    });
  }, []);

  // Unified handler for hero CTA (JD required)
  const handleHeroStartResume = () => {
    if (!jobDescription.trim()) {
      setShowJDValidation(true);
      return;
    }
    setShowJDValidation(false);
    navigate('/step1', { state: { jobDescription } });
  };

  // For the modal flow (login required, can skip JD)
  const handleGetStarted = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!jobDescription.trim()) {
      setShowJobModal(true);
      return;
    }
    navigate('/step1', { state: { jobDescription } });
  };


  const handleJobModalSubmit = (jd: string) => {
    setJobDescription(jd);
    setShowJobModal(false);
    if (selectedTemplateId) {
      navigate('/step1', { state: { jobDescription: jd, templateId: selectedTemplateId } });
      setSelectedTemplateId('');
    } else {
      navigate('/step1', { state: { jobDescription: jd } });
    }
  };

  const handleJobModalSkip = () => {
    setShowJobModal(false);
    navigate('/step1', { state: { jobDescription: '' } });
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900 relative overflow-x-hidden">
      {/* Animated background gradient and blobs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-cyan-200 opacity-30 blur-3xl animate-blob1" />
        <div className="absolute top-1/2 left-[60%] w-[340px] h-[340px] rounded-full bg-blue-200 opacity-20 blur-2xl animate-blob2" />
        <div className="absolute bottom-0 right-0 w-[320px] h-[320px] rounded-full bg-emerald-200 opacity-20 blur-2xl animate-blob3" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.10),_transparent_45%)]" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_12px_24px_rgba(15,23,42,0.2)]">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-black tracking-tight text-slate-950">CVLuck</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Job-First AI Resume Builder</p>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-sm font-semibold text-slate-700 md:flex">
            <button onClick={() => navigate('/')} className="hover:text-slate-900">Home</button>
            <button onClick={() => navigate('/templates')} className="hover:text-slate-900">Templates</button>
            <button onClick={() => navigate('/auth')} className="hover:text-slate-900">Login</button>
          </div>
          <button
            onClick={handleGetStarted}
            className="rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(15,23,42,0.2)] transition-transform hover:-translate-y-0.5"
          >
            Build My Resume
          </button>
        </div>
      </nav>


      <main className="px-6 pb-24 pt-12">
        <section className="mx-auto max-w-6xl flex flex-col justify-center min-h-[70vh] relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 w-full">
            {/* LEFT SIDE: Content */}
            <div className="flex-1 flex flex-col items-start justify-center w-full max-w-xl">
              <h1 className="text-5xl md:text-6xl font-black leading-[1.05] text-slate-950 relative">
                Build a
                <span className="relative inline-block mx-2">
                  <span className="z-10 relative">job-winning</span>
                  <span className="absolute left-0 right-0 bottom-0 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full blur-[2px] opacity-60 animate-underline" />
                </span>
                ATS resume
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 animate-gradient-text">in minutes</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600">
                Paste any job description and get a resume tailored for that role. <span className="font-semibold text-cyan-700">Clean</span>, <span className="font-semibold text-blue-700">ATS-friendly</span>, and <span className="font-semibold text-emerald-700">ready to submit</span>.
              </p>
              {/* Chips */}
              <div className="mt-6 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
                  <ShieldCheck className="h-4 w-4 text-cyan-600" />
                  ATS-friendly
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
                  <Sparkles className="h-4 w-4 text-cyan-600 animate-spin-slow" />
                  AI-optimized
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
                  <Target className="h-4 w-4 text-cyan-600" />
                  Job-description based
                </div>
              </div>
              {/* Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full">
                <button
                  onClick={handleGetStarted}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-8 py-4 text-lg font-bold text-white shadow-[0_18px_40px_rgba(15,23,42,0.22)] transition-all hover:-translate-y-1 hover:scale-105 hover:shadow-cyan-200/40 hover:bg-slate-900 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                >
                  Build My Resume
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => navigate('/templates')}
                  className="flex-1 inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white/80 px-8 py-4 text-lg font-bold text-slate-900 transition-all hover:-translate-y-1 hover:scale-105 hover:border-cyan-400 hover:bg-cyan-50/60 focus:ring-2 focus:ring-cyan-200 focus:outline-none"
                >
                  View Templates
                </button>
              </div>
            </div>

            {/* RIGHT SIDE: Job Description Box */}
            <div className="flex-1 w-full max-w-xl flex items-center justify-center">
              <div className="w-full rounded-3xl border border-slate-200 bg-white/60 backdrop-blur-xl p-8 shadow-[0_26px_60px_rgba(15,23,42,0.14)] relative overflow-hidden">
                {/* Animated AI badge */}
                <div className="absolute top-6 right-6 flex items-center gap-2">
                  <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700 animate-pulse shadow-cyan-200/40 shadow-md">AI Ready</span>
                  <Sparkles className="h-5 w-5 text-cyan-400 animate-bounce" />
                </div>
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Job Description</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">Paste the role here</p>
                </div>
                <textarea
                  value={jobDescription}
                  onChange={e => {
                    setJobDescription(e.target.value);
                    if (showJDValidation && e.target.value.trim()) setShowJDValidation(false);
                  }}
                  placeholder="Paste job description here..."
                  className="h-72 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-4 text-base text-slate-800 outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 backdrop-blur"
                />
                <div className="mt-6">
                  {showJDValidation && (
                    <div className="mb-3 text-sm text-rose-600 font-medium transition-all animate-fade-in">
                      Paste a job description to continue
                    </div>
                  )}
                  <button
                    onClick={handleHeroStartResume}
                    className="w-full rounded-2xl bg-slate-950 px-8 py-4 text-lg font-bold text-white shadow-[0_18px_40px_rgba(15,23,42,0.22)] transition-all hover:-translate-y-1 hover:scale-105 hover:shadow-cyan-200/40 hover:bg-slate-900 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                  >
                    Start Building Resume
                  </button>
                </div>
                {/* Glassmorphism shine effect */}
                <div className="pointer-events-none absolute -top-10 -left-10 w-1/2 h-1/2 bg-white/30 rounded-full blur-2xl opacity-40 animate-shine" />
              </div>
            </div>
          </div>
        </section>

        

        {/* ...existing code... */}

        <section className="mx-auto mt-16 max-w-6xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.1)]">
          <h2 className="text-3xl font-black text-slate-900">Why CVLuck is different</h2>
          <p className="mt-2 text-slate-600">Job-first AI vs. generic resume builders.</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-sm font-semibold uppercase text-emerald-700">CVLuck</p>
              <ul className="mt-3 space-y-2 text-sm text-emerald-900">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5" />Job-specific resumes</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5" />AI-enhanced content</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5" />ATS optimized structure</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5" />Smart keyword matching</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold uppercase text-slate-600">Others</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2"><XCircle className="h-4 w-4 mt-0.5 text-rose-500" />Generic templates</li>
                <li className="flex items-start gap-2"><XCircle className="h-4 w-4 mt-0.5 text-rose-500" />Manual editing</li>
                <li className="flex items-start gap-2"><XCircle className="h-4 w-4 mt-0.5 text-rose-500" />No job targeting</li>
                <li className="flex items-start gap-2"><XCircle className="h-4 w-4 mt-0.5 text-rose-500" />Weak optimization</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-6xl">
          <h2 className="text-3xl font-black text-slate-900">Template showcase</h2>
          <p className="mt-2 text-slate-600">Choose from ATS-friendly templates designed for hiring managers.</p>
          <div className="mt-6 pt-4 overflow-x-auto scrollbar-hide">
            <div ref={showcaseRef} className="flex gap-8 min-w-[700px] pb-4" style={{paddingTop: '8px', paddingBottom: '8px'}}>
              {templates.map((template: TemplateCard) => {
                const isSelected = showcaseSelected === template.id;
                return (
                  <div
                    key={template.id}
                    className={
                      `template-card-anim min-w-[340px] max-w-[360px] flex-shrink-0 rounded-2xl border bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] relative cursor-pointer transition-all duration-300 ` +
                      (isSelected ? 'border-blue-500 ring-2 ring-blue-200 shadow-blue-100 z-10' : 'border-slate-200')
                    }
                    style={{
                      boxShadow: isSelected ? '0 0 0 4px #38bdf8, 0 18px 40px rgba(15,23,42,0.08)' : undefined,
                      marginLeft: isSelected ? '8px' : undefined,
                      marginRight: isSelected ? '8px' : undefined,
                    }}
                    onMouseEnter={() => setShowcaseSelected(template.id)}
                    onClick={() => setShowcaseSelected(template.id)}
                  >
                    {/* {isBest && (
                      <span className="absolute top-4 left-4 z-10 bg-gradient-to-r from-yellow-400 to-yellow-200 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow">Best Seller</span>
                    )} */}
                    <div className={
                      'relative mb-4 h-64 w-full overflow-hidden rounded-xl border bg-slate-50 ' +
                      (isSelected ? 'border-blue-400 shadow-lg' : 'border-slate-200')
                    }>
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
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">{template.name}</p>
                        <p className="text-xs text-slate-500">{template.category}</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                        ATS
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{template.description}</p>
                    <p className="text-xs text-slate-500 mb-2"><span className="font-medium">Best for:</span> {template.bestFor}</p>
                    <button
                      className={
                        'mt-2 w-full rounded-xl py-2 text-sm font-semibold transition-all ' +
                        (isSelected ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-slate-950 text-white hover:bg-slate-800')
                      }
                      onClick={() => {
                        setSelectedTemplateId(template.id);
                        setShowJobModal(true);
                      }}
                    >
                      Use Template
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-6xl">
          <h2 className="text-3xl font-black text-slate-900">AI intelligence inside CVLuck</h2>
          <p className="mt-2 text-slate-600">Everything the AI improves for you.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {aiHighlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-cyan-50 p-5 shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Success Stories Section - Slider */}
        <section className="mx-auto mt-16 max-w-6xl rounded-[32px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-blue-100 p-8 shadow-[0_24px_60px_rgba(56,189,248,0.08)]">
          <h2 className="text-3xl font-black text-slate-900">Success Stories</h2>
          <p className="mt-2 text-slate-600">Real users. Real results. See how CVLuck helped job seekers land interviews and offers.</p>
          <div className="mt-8 overflow-x-auto scrollbar-hide">
            <div className="flex gap-6 min-w-[700px] pb-2">
              {testimonials.map((item, idx) => (
                <div key={item.name + idx} className="min-w-[320px] max-w-[340px] flex-shrink-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center text-center">
                  <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-700 text-2xl font-bold">
                    {item.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <p className="text-base text-slate-700 mb-3">"{item.quote}"</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-6xl">
          <h2 className="text-3xl font-black text-slate-900">Who is CVLuck for?</h2>
          <p className="mt-2 text-slate-600 max-w-2xl">CVLuck helps job seekers at every stage. Whether you’re just starting out, switching careers, or applying at scale, there’s a template and AI flow for you.</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map((audience, idx) => (
              <div
                key={audience.title}
                className={
                  `rounded-2xl p-6 flex flex-col items-center text-center shadow-md transition-transform hover:-translate-y-1 hover:shadow-lg ` +
                  (idx % 2 === 0 ? 'bg-cyan-50 border border-cyan-100' : 'bg-white border border-slate-200')
                }
              >
                <div className="mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-cyan-200 to-cyan-400 text-cyan-900 text-2xl shadow">
                  <audience.icon className="h-7 w-7" />
                </div>
                <p className="text-lg font-bold text-slate-900 mb-1">{audience.title}</p>
                <p className="text-sm text-slate-600">{audience.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Resume Tips & Tricks Section */}
        <section className="mx-auto mt-16 max-w-6xl rounded-[32px] border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-8 shadow-[0_24px_60px_rgba(56,189,248,0.08)]">
          <h2 className="text-3xl font-black text-slate-900">Resume Tips & Tricks</h2>
          <p className="mt-2 text-slate-600">Boost your chances with these expert-backed resume tips.</p>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
              <div className="mb-3 flex items-center justify-center w-10 h-10 rounded-full bg-cyan-100 text-cyan-700">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="font-semibold text-slate-900 mb-2">Tailor for Every Job</p>
              <p className="text-sm text-slate-600">Customize your resume for each application. Use keywords from the job description to pass ATS scans and catch recruiter attention.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
              <div className="mb-3 flex items-center justify-center w-10 h-10 rounded-full bg-cyan-100 text-cyan-700">
                <Zap className="h-5 w-5" />
              </div>
              <p className="font-semibold text-slate-900 mb-2">Show Impact, Not Just Tasks</p>
              <p className="text-sm text-slate-600">Use action verbs and quantify achievements. Recruiters love to see results, not just responsibilities.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
              <div className="mb-3 flex items-center justify-center w-10 h-10 rounded-full bg-cyan-100 text-cyan-700">
                <PenTool className="h-5 w-5" />
              </div>
              <p className="font-semibold text-slate-900 mb-2">Keep It Concise</p>
              <p className="text-sm text-slate-600">Stick to one page if possible. Focus on your most relevant experience and skills for the role.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
              <div className="mb-3 flex items-center justify-center w-10 h-10 rounded-full bg-cyan-100 text-cyan-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="font-semibold text-slate-900 mb-2">Proofread & Format</p>
              <p className="text-sm text-slate-600">Check for typos and use a clean, professional format. Good formatting makes your resume easy to read and more likely to be noticed.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-6xl">
          <h2 className="text-3xl font-black text-slate-900">FAQ</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faqs.map((faq, index) => (
              <button
                key={faq.q}
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:border-slate-300"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{faq.q}</p>
                  {openFaq === index ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </div>
                {openFaq === index && (
                  <p className="mt-2 text-sm text-slate-600">{faq.a}</p>
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-6xl rounded-[32px] bg-slate-950 p-8 text-white">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-black">Ready to build a resume for the job you actually want?</h2>
              <p className="mt-2 text-sm text-slate-300">Paste your job description and get a tailored resume in minutes.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleGetStarted}
                className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-950"
              >
                Build My Resume
              </button>
              <button
                onClick={() => navigate('/templates')}
                className="rounded-2xl border border-slate-700 px-6 py-3 text-sm font-semibold text-white"
              >
                View Templates
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-bold text-slate-900">CVLuck</p>
            <p className="text-sm text-slate-500">Job-description-first AI resume builder.</p>
            <p className="mt-2 text-xs text-slate-400">© 2026 CVLuck. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-semibold text-slate-600">
            <button onClick={() => navigate('/')}>Home</button>
            <button onClick={() => navigate('/templates')}>Templates</button>
            <button onClick={() => navigate('/auth')}>Login</button>
            <button>Contact</button>
            <button>Privacy</button>
          </div>
        </div>
      </footer>

      <JobDescriptionModal
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
        onSubmit={handleJobModalSubmit}
        onSkip={handleJobModalSkip}
      />
    </div>
  );
}
