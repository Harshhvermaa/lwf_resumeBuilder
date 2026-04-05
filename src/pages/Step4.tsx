import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Plus, Save, X } from 'lucide-react';
import StepProgress from '../components/StepProgress';
import JobContextBanner from '../components/JobContextBanner';
import { useAuth } from '../contexts/AuthContext';
import { ResumeData, supabase } from '../lib/supabase';
import { getJobDescription, normalizeResumeData, toResumeInsertPayload } from '../lib/resumeData';

export default function Step4() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const initialData = normalizeResumeData((location.state as any)?.resumeData || {});

  const [resumeData, setResumeData] = useState<ResumeData>(initialData);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [generationError] = useState('');

  const handleBack = () => {
    if (resumeData.id) {
      navigate('/dashboard');
      return;
    }

    navigate('/step3', { state: { resumeData }, replace: true });
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setSaveMessage('');

    try {
      const { data, error } = await supabase
        .from('resumes')
        .insert([toResumeInsertPayload(resumeData, user.id)])
        .select()
        .maybeSingle();

      if (error) throw error;

      setSaveMessage('Saved successfully!');
      setTimeout(() => setSaveMessage(''), 2000);

      if (data) {
        setResumeData({ ...resumeData, id: data.id });
      }
    } catch (error) {
      console.error(error);
      setSaveMessage('Error saving resume');
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = () => {
    navigate('/step5', { state: { resumeData }, replace: true });
  };

  const addSkill = () => {
    setResumeData({
      ...resumeData,
      skills: [...(resumeData.skills || []), ''],
    });
  };

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...(resumeData.skills || [])];
    newSkills[index] = value;
    const aiMeta = resumeData.aiMeta || {};
    const updatedSkillsAdded = (aiMeta.skillsAdded || []).filter(
      (skill) => skill.toLowerCase().trim() !== value.toLowerCase().trim()
    );
    setResumeData({
      ...resumeData,
      skills: newSkills,
      aiMeta: {
        ...aiMeta,
        skillsAdded: updatedSkillsAdded,
      },
    });
  };

  const removeSkill = (index: number) => {
    const removed = (resumeData.skills || [])[index];
    const aiMeta = resumeData.aiMeta || {};
    const updatedSkillsAdded = (aiMeta.skillsAdded || []).filter(
      (skill) => skill.toLowerCase().trim() !== (removed || '').toLowerCase().trim()
    );
    setResumeData({
      ...resumeData,
      skills: (resumeData.skills || []).filter((_, i) => i !== index),
      aiMeta: {
        ...aiMeta,
        skillsAdded: updatedSkillsAdded,
      },
    });
  };

  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [
        ...(resumeData.experience || []),
        { title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' },
      ],
    });
  };

  const updateExperience = (index: number, field: string, value: string | boolean) => {
    const newExperience = [...(resumeData.experience || [])];
    newExperience[index] = { ...newExperience[index], [field]: value };
    const aiMeta = resumeData.aiMeta || {};
    const updatedEnhanced = (aiMeta.experienceEnhanced || []).filter((expIndex) => expIndex !== index);
    setResumeData({
      ...resumeData,
      experience: newExperience,
      aiMeta: {
        ...aiMeta,
        experienceEnhanced: updatedEnhanced,
      },
    });
  };

  const removeExperience = (index: number) => {
    setResumeData({
      ...resumeData,
      experience: (resumeData.experience || []).filter((_, i) => i !== index),
    });
  };

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [...(resumeData.education || []), { degree: '', school: '', location: '', graduationDate: '', gpa: '' }],
    });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const newEducation = [...(resumeData.education || [])];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setResumeData({ ...resumeData, education: newEducation });
  };

  const removeEducation = (index: number) => {
    setResumeData({
      ...resumeData,
      education: (resumeData.education || []).filter((_, i) => i !== index),
    });
  };

  const addCertification = () => {
    setResumeData({
      ...resumeData,
      certifications: [...(resumeData.certifications || []), { name: '', issuer: '', date: '' }],
    });
  };

  const updateCertification = (index: number, field: string, value: string) => {
    const newCertifications = [...(resumeData.certifications || [])];
    newCertifications[index] = { ...newCertifications[index], [field]: value };
    setResumeData({ ...resumeData, certifications: newCertifications });
  };

  const removeCertification = (index: number) => {
    setResumeData({
      ...resumeData,
      certifications: (resumeData.certifications || []).filter((_, i) => i !== index),
    });
  };

  const handleProfileImageChange = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setResumeData({ ...resumeData, profile_image: result });
    };
    reader.readAsDataURL(file);
  };

  const handleProfileImageRemove = () => {
    setResumeData({ ...resumeData, profile_image: '' });
  };

  const addProject = () => {
    setResumeData({
      ...resumeData,
      projects: [...(resumeData.projects || []), { name: '', description: '', technologies: [''], link: '' }],
    });
  };

  const updateProject = (index: number, field: string, value: string) => {
    const newProjects = [...(resumeData.projects || [])];
    if (field === 'technologies') {
      newProjects[index] = {
        ...newProjects[index],
        technologies: value.split(',').map((item) => item.trim()).filter(Boolean),
      };
    } else {
      newProjects[index] = { ...newProjects[index], [field]: value };
    }
    setResumeData({ ...resumeData, projects: newProjects });
  };

  const removeProject = (index: number) => {
    setResumeData({
      ...resumeData,
      projects: (resumeData.projects || []).filter((_, i) => i !== index),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="rounded-lg p-2 transition-colors hover:bg-slate-100">
              <ArrowLeft className="h-5 w-5 text-slate-700" />
            </button>
            <span className="text-lg font-semibold text-slate-900">CVLuck</span>
          </div>

          <div className="flex items-center gap-3">
            {saveMessage && <span className="text-sm font-medium text-green-600">{saveMessage}</span>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </nav>

      <JobContextBanner jobDescription={getJobDescription(resumeData)} />
      <StepProgress currentStep={4} />

      <div className="mx-auto max-w-5xl px-6 pb-16">
        <div className="mb-10 text-center">
          <h1 className="mb-4 text-4xl font-bold text-slate-900">Confirm Your Details</h1>
          <p className="text-lg text-slate-600">
            Review your information first. Once you confirm, we&apos;ll generate the final resume for preview and download.
          </p>
        </div>

        <div className="space-y-6">
          {generationError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-900">Generation could not be completed</p>
                  <p className="mt-1 text-sm text-amber-800">{generationError}</p>
                </div>
              </div>
            </div>
          ) : null}

          {resumeData.extractionStatus === 'partial' && resumeData.extractionError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-900">Review extracted details</p>
                  <p className="mt-1 text-sm text-amber-800">{resumeData.extractionError}</p>
                </div>
              </div>
            </div>
          )}

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Personal Information</h2>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="h-20 w-20 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                  {resumeData.profile_image ? (
                    <img
                      src={resumeData.profile_image}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-500">
                      No Image
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Profile Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleProfileImageChange(e.target.files?.[0])}
                      className="text-sm text-slate-600"
                    />
                  </div>
                  {resumeData.profile_image && (
                    <button
                      type="button"
                      onClick={handleProfileImageRemove}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                    >
                      Remove Image
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={resumeData.name}
                  onChange={(e) => setResumeData({ ...resumeData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    value={resumeData.email}
                    onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
                  <input
                    type="tel"
                    value={resumeData.phone}
                    onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Location</label>
                <input
                  type="text"
                  value={resumeData.location}
                  onChange={(e) => setResumeData({ ...resumeData, location: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2">
                  <label className="block text-sm font-medium text-slate-700">Professional Summary</label>
                  {resumeData.aiMeta?.summaryEnhanced && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      AI Enhanced
                    </span>
                  )}
                </div>
                <textarea
                  value={resumeData.summary}
                  onChange={(e) =>
                    setResumeData({
                      ...resumeData,
                      summary: e.target.value,
                      aiMeta: { ...resumeData.aiMeta, summaryEnhanced: false },
                    })
                  }
                  rows={4}
                  className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Skills</h2>
              <button onClick={addSkill} className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                <Plus className="h-4 w-4" />
                Add Skill
              </button>
            </div>

            <div className="space-y-3">
              {(resumeData.skills || []).map((skill, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => updateSkill(index, e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                  {resumeData.aiMeta?.skillsAdded?.some(
                    (item) => item.toLowerCase().trim() === skill.toLowerCase().trim()
                  ) && (
                    <span className="self-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      AI Added
                    </span>
                  )}
                  <button onClick={() => removeSkill(index)} className="p-2 text-slate-400 transition-colors hover:text-red-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Work Experience</h2>
              <button
                onClick={addExperience}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Experience
              </button>
            </div>

            <div className="space-y-6">
              {(resumeData.experience || []).map((exp, index) => (
                <div key={index} className="border-b border-slate-200 pb-6 last:border-0">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-slate-900">Experience {index + 1}</h3>
                      {resumeData.aiMeta?.experienceEnhanced?.includes(index) && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                          AI Enhanced
                        </span>
                      )}
                    </div>
                    <button onClick={() => removeExperience(index)} className="text-slate-400 transition-colors hover:text-red-600">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => updateExperience(index, 'title', e.target.value)}
                        placeholder="Job Title"
                        className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        placeholder="Company"
                        className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => updateExperience(index, 'location', e.target.value)}
                      placeholder="Location"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />

                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                        placeholder="Start Date (e.g., Jan 2020)"
                        className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                        placeholder="End Date or leave blank"
                        disabled={exp.current}
                        className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                        className="rounded border-slate-300"
                      />
                      <span className="text-slate-700">I currently work here</span>
                    </label>

                    <textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                      placeholder="Description of responsibilities and achievements"
                      rows={3}
                      className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Education</h2>
              <button onClick={addEducation} className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                <Plus className="h-4 w-4" />
                Add Education
              </button>
            </div>

            <div className="space-y-6">
              {(resumeData.education || []).map((edu, index) => (
                <div key={index} className="border-b border-slate-200 pb-6 last:border-0">
                  <div className="mb-4 flex items-start justify-between">
                    <h3 className="font-medium text-slate-900">Education {index + 1}</h3>
                    <button onClick={() => removeEducation(index)} className="text-slate-400 transition-colors hover:text-red-600">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        placeholder="Degree"
                        className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => updateEducation(index, 'school', e.target.value)}
                        placeholder="Institution"
                        className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <input
                        type="text"
                        value={edu.location}
                        onChange={(e) => updateEducation(index, 'location', e.target.value)}
                        placeholder="Location"
                        className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={edu.graduationDate}
                        onChange={(e) => updateEducation(index, 'graduationDate', e.target.value)}
                        placeholder="Graduation Date"
                        className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={edu.gpa}
                        onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                        placeholder="GPA / Score"
                        className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Certifications / Courses</h2>
              <button
                onClick={addCertification}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Entry
              </button>
            </div>

            <div className="space-y-6">
              {(resumeData.certifications || []).map((certification, index) => (
                <div key={index} className="border-b border-slate-200 pb-6 last:border-0">
                  <div className="mb-4 flex items-start justify-between">
                    <h3 className="font-medium text-slate-900">Entry {index + 1}</h3>
                    <button
                      onClick={() => removeCertification(index)}
                      className="text-slate-400 transition-colors hover:text-red-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <input
                      type="text"
                      value={certification.name}
                      onChange={(e) => updateCertification(index, 'name', e.target.value)}
                      placeholder="Course / Certification Name"
                      className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={certification.issuer}
                      onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                      placeholder="Issuer"
                      className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={certification.date}
                      onChange={(e) => updateCertification(index, 'date', e.target.value)}
                      placeholder="Date"
                      className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Projects</h2>
              <button
                onClick={addProject}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Project
              </button>
            </div>

            <div className="space-y-6">
              {(resumeData.projects || []).map((project, index) => (
                <div key={index} className="border-b border-slate-200 pb-6 last:border-0">
                  <div className="mb-4 flex items-start justify-between">
                    <h3 className="font-medium text-slate-900">Project {index + 1}</h3>
                    <button
                      onClick={() => removeProject(index)}
                      className="text-slate-400 transition-colors hover:text-red-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={project.name}
                      onChange={(e) => updateProject(index, 'name', e.target.value)}
                      placeholder="Project Name"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      value={project.description}
                      onChange={(e) => updateProject(index, 'description', e.target.value)}
                      placeholder="Short description of the project"
                      rows={3}
                      className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={(project.technologies || []).join(', ')}
                      onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                      placeholder="Technologies (comma-separated)"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
          <div className="sticky bottom-4 z-10">
            <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.12)] backdrop-blur">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Ready to generate your resume?</p>
                  <p className="text-xs text-slate-500">You can still edit details after preview.</p>
                </div>
                <button
                  onClick={handleContinue}
                  className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto"
                >
                  Generate Resume
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
