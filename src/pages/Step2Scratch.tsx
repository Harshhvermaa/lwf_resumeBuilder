import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, X, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import StepProgress from '../components/StepProgress';
import { normalizeResumeData } from '../lib/resumeData';
import { ROUTES } from '../lib/routes';
import { usePageMeta } from '../lib/usePageMeta';
import {
  generateExperienceFallback,
  generateSummaryFallback,
  generateSummaryFromContext,
  generateSummaryWithAI,
  improveExperienceWithAI,
} from '../lib/resumeAi';

export default function Step2Scratch() {
  const navigate = useNavigate();
  const location = useLocation();
  const jobDescription = (location.state as any)?.jobDescription || '';
  const templateId = (location.state as any)?.templateId || 'modern';

  usePageMeta({
    title: 'Build Resume From Scratch',
    description: 'Add your resume information manually and build a structured resume from scratch in JobOnlink.',
    canonicalPath: ROUTES.step2Scratch,
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    skills: [''],
    experience: [{ title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' }],
    education: [{ degree: '', school: '', location: '', graduationDate: '', gpa: '' }],
    projects: [{ name: '', description: '', technologies: [''], link: '' }],
    certifications: [{ name: '', issuer: '', date: '' }],
  });
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [experienceLoadingIndex, setExperienceLoadingIndex] = useState<number | null>(null);
  const [aiError, setAiError] = useState('');
  const [showSummaryPrompt, setShowSummaryPrompt] = useState(false);
  const [summaryContext, setSummaryContext] = useState('');
  const [showExperiencePromptIndex, setShowExperiencePromptIndex] = useState<number | null>(null);
  const [experienceContext, setExperienceContext] = useState<Record<number, string>>({});

  const buildResumeData = () =>
    normalizeResumeData({
      jobDescription,
      job_description: jobDescription,
      ...formData,
      skills: formData.skills.filter((s) => s.trim()),
      certifications: formData.certifications.filter((item) => item.name.trim() || item.issuer.trim() || item.date.trim()),
      template_id: templateId,
      extractionStatus: 'idle',
      extractionSource: 'scratch',
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(ROUTES.step3, { state: { resumeData: buildResumeData() } });
  };

  const addSkill = () => {
    setFormData({ ...formData, skills: [...formData.skills, ''] });
  };

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...formData.skills];
    newSkills[index] = value;
    setFormData({ ...formData, skills: newSkills });
  };

  const removeSkill = (index: number) => {
    setFormData({ ...formData, skills: formData.skills.filter((_, i) => i !== index) });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' }],
    });
  };

  const updateExperience = (index: number, field: string, value: string | boolean) => {
    const newExperience = [...formData.experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setFormData({ ...formData, experience: newExperience });
  };

  const removeExperience = (index: number) => {
    setFormData({
      ...formData,
      experience: formData.experience.filter((_, i) => i !== index),
    });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { degree: '', school: '', location: '', graduationDate: '', gpa: '' }],
    });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const newEducation = [...formData.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setFormData({ ...formData, education: newEducation });
  };

  const removeEducation = (index: number) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index),
    });
  };

  const addCertification = () => {
    setFormData({
      ...formData,
      certifications: [...formData.certifications, { name: '', issuer: '', date: '' }],
    });
  };

  const updateCertification = (index: number, field: string, value: string) => {
    const newCertifications = [...formData.certifications];
    newCertifications[index] = { ...newCertifications[index], [field]: value };
    setFormData({ ...formData, certifications: newCertifications });
  };

  const removeCertification = (index: number) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((_, i) => i !== index),
    });
  };

  const handleGenerateSummary = async () => {
    setAiError('');
    if (!jobDescription && !summaryContext.trim()) {
      setShowSummaryPrompt(true);
      return;
    }

    setSummaryLoading(true);
    try {
      const summary = jobDescription
        ? await generateSummaryWithAI(buildResumeData(), jobDescription)
        : await generateSummaryFromContext(buildResumeData(), summaryContext, '');
      setFormData((prev) => ({ ...prev, summary }));
      setShowSummaryPrompt(false);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      const fallbackSummary = generateSummaryFallback(buildResumeData(), jobDescription, summaryContext);
      setFormData((prev) => ({ ...prev, summary: fallbackSummary || prev.summary }));
      setShowSummaryPrompt(false);
      setAiError('AI summary is temporarily unavailable, so we drafted a summary from your details. You can edit it anytime.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleImproveExperience = async (index: number) => {
    setAiError('');
    if (!jobDescription && !experienceContext[index]?.trim()) {
      setShowExperiencePromptIndex(index);
      return;
    }

    setExperienceLoadingIndex(index);
    try {
      const description = await improveExperienceWithAI(
        buildResumeData(),
        index,
        jobDescription,
        jobDescription ? '' : experienceContext[index] || ''
      );
      const newExperience = [...formData.experience];
      newExperience[index] = { ...newExperience[index], description };
      setFormData((prev) => ({ ...prev, experience: newExperience }));
      setShowExperiencePromptIndex(null);
    } catch (error) {
      console.error('Failed to improve experience:', error);
      const fallbackDescription = generateExperienceFallback(
        buildResumeData(),
        index,
        jobDescription,
        jobDescription ? '' : experienceContext[index] || ''
      );
      const newExperience = [...formData.experience];
      newExperience[index] = { ...newExperience[index], description: fallbackDescription || newExperience[index].description };
      setFormData((prev) => ({ ...prev, experience: newExperience }));
      setShowExperiencePromptIndex(null);
      setAiError('AI experience writing is temporarily unavailable, so we drafted it from your details. You can edit it anytime.');
    } finally {
      setExperienceLoadingIndex(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(ROUTES.step1, { state: { jobDescription } })}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <span className="text-lg font-semibold text-slate-900">JobOnlink</span>
        </div>
      </nav>

      <StepProgress currentStep={2} />

      <div className="max-w-3xl mx-auto px-6 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Tell Us About Yourself</h1>
          <p className="text-lg text-slate-600">Fill in your information to create your resume</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {aiError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">{aiError}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Personal Information</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Professional Summary</label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Brief summary of your professional background and goals..."
              />
              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={summaryLoading}
                className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                {summaryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {summaryLoading ? 'Writing summary...' : 'Write with AI'}
              </button>
              {!jobDescription && showSummaryPrompt && (
                <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm font-medium text-slate-900 mb-2">
                    Tell us a little about yourself and we’ll turn it into a professional summary.
                  </p>
                  <textarea
                    value={summaryContext}
                    onChange={(e) => setSummaryContext(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-white"
                    placeholder="Example: I am an MBA student interested in HR and marketing, with internship experience in recruitment, coordination, and digital marketing..."
                  />
                  <button
                    type="button"
                    onClick={handleGenerateSummary}
                    disabled={summaryLoading || !summaryContext.trim()}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {summaryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Generate Summary
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Skills</h2>
              <button
                type="button"
                onClick={addSkill}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Skill
              </button>
            </div>

            <div className="space-y-3">
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => updateSkill(index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., JavaScript, React, Python"
                  />
                  {formData.skills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="p-3 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Work Experience</h2>
              <button
                type="button"
                onClick={addExperience}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Experience
              </button>
            </div>

            {formData.experience.map((exp, index) => (
              <div key={index} className="space-y-4 pb-6 mb-6 border-b border-slate-200 last:border-0 last:pb-0 last:mb-0">
                {formData.experience.length > 1 && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Job Title</label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => updateExperience(index, 'title', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Software Engineer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Tech Corp"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => updateExperience(index, 'location', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Agra, India"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Jan 2025"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
                    <input
                      type="text"
                      value={exp.endDate}
                      onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                      disabled={exp.current}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-100"
                      placeholder="Mar 2025"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm pt-9">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <span className="text-slate-700">I currently work here</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    placeholder="Describe your responsibilities and achievements..."
                  />
                  <button
                    type="button"
                    onClick={() => handleImproveExperience(index)}
                    disabled={experienceLoadingIndex === index}
                    className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                  >
                    {experienceLoadingIndex === index ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {experienceLoadingIndex === index ? 'Writing experience...' : 'Write with AI'}
                  </button>
                  {!jobDescription && showExperiencePromptIndex === index && (
                    <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                      <p className="text-sm font-medium text-slate-900 mb-2">
                        Tell us a little more about this role so we can write it professionally.
                      </p>
                      <textarea
                        value={experienceContext[index] || ''}
                        onChange={(e) =>
                          setExperienceContext((prev) => ({
                            ...prev,
                            [index]: e.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-white"
                        placeholder="Example: I handled recruitment coordination, helped with social media marketing, supported content creation, and worked with the team on campaigns..."
                      />
                      <button
                        type="button"
                        onClick={() => handleImproveExperience(index)}
                        disabled={experienceLoadingIndex === index || !(experienceContext[index] || '').trim()}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {experienceLoadingIndex === index ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        Generate Experience
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Education</h2>
              <button
                type="button"
                onClick={addEducation}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Education
              </button>
            </div>

            {formData.education.map((education, index) => (
              <div key={index} className="space-y-4 pb-6 mb-6 border-b border-slate-200 last:border-0 last:pb-0 last:mb-0">
                {formData.education.length > 1 && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Degree</label>
                    <input
                      type="text"
                      value={education.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="MBA in Human Resources"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Institution</label>
                    <input
                      type="text"
                      value={education.school}
                      onChange={(e) => updateEducation(index, 'school', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="University Name"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={education.location}
                      onChange={(e) => updateEducation(index, 'location', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Agra, India"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Graduation Date</label>
                    <input
                      type="text"
                      value={education.graduationDate}
                      onChange={(e) => updateEducation(index, 'graduationDate', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="05/2026"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">GPA / Score</label>
                    <input
                      type="text"
                      value={education.gpa}
                      onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="3.8 / 4.0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Certificates / Courses</h2>
              <button
                type="button"
                onClick={addCertification}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Entry
              </button>
            </div>

            {formData.certifications.map((certification, index) => (
              <div key={index} className="space-y-4 pb-6 mb-6 border-b border-slate-200 last:border-0 last:pb-0 last:mb-0">
                {formData.certifications.length > 1 && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={certification.name}
                      onChange={(e) => updateCertification(index, 'name', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Digital Marketing Advanced Course"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Issuer</label>
                    <input
                      type="text"
                      value={certification.issuer}
                      onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Institute / Platform"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                    <input
                      type="text"
                      value={certification.date}
                      onChange={(e) => updateCertification(index, 'date', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="2024"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
          >
            Continue to Templates
          </button>
        </form>
      </div>
    </div>
  );
}
