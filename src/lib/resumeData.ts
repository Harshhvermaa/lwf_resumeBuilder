import { ResumeData } from './supabase';

type PartialResumeData = Partial<ResumeData> & {
  jobDescription?: string;
};

const emptyExperience = () => ({
  title: '',
  company: '',
  location: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
});

const emptyEducation = () => ({
  degree: '',
  school: '',
  location: '',
  graduationDate: '',
  gpa: '',
});

const emptyProject = () => ({
  name: '',
  description: '',
  technologies: [''],
  link: '',
});

export function createEmptyResumeData(jobDescription = ''): ResumeData {
  return {
    job_description: jobDescription,
    jobDescription,
    name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    profile_image: '',
    skills: [''],
    experience: [emptyExperience()],
    education: [emptyEducation()],
    projects: [emptyProject()],
    aiMeta: {
      summaryEnhanced: false,
      skillsAdded: [],
      experienceEnhanced: [],
    },
    certifications: [],
    template_id: 'modern',
    extractionStatus: 'idle',
    extractionSource: 'scratch',
  };
}

export function getJobDescription(resumeData?: PartialResumeData | null) {
  if (!resumeData) return '';
  return resumeData.jobDescription || resumeData.job_description || '';
}

export function normalizeResumeData(
  resumeData?: PartialResumeData | null,
  fallbackJobDescription = ''
): ResumeData {
  const base = createEmptyResumeData(fallbackJobDescription);
  const jobDescription = getJobDescription(resumeData) || fallbackJobDescription;

  return {
    ...base,
    ...resumeData,
    job_description: jobDescription,
    jobDescription,
    profile_image: resumeData?.profile_image || base.profile_image,
    skills:
      resumeData?.skills && resumeData.skills.length > 0
        ? resumeData.skills
        : base.skills,
    experience:
      resumeData?.experience && resumeData.experience.length > 0
        ? resumeData.experience
        : base.experience,
    education:
      resumeData?.education && resumeData.education.length > 0
        ? resumeData.education
        : base.education,
    projects:
      resumeData?.projects && resumeData.projects.length > 0
        ? resumeData.projects
        : base.projects,
    aiMeta: resumeData?.aiMeta || base.aiMeta,
    certifications: resumeData?.certifications || base.certifications,
    template_id: resumeData?.template_id || base.template_id,
  };
}

export function toResumeInsertPayload(resumeData: ResumeData, userId: string) {
  const normalized = normalizeResumeData(resumeData);

  return {
    user_id: userId,
    job_description: normalized.job_description,
    name: normalized.name,
    email: normalized.email,
    phone: normalized.phone,
    location: normalized.location,
    summary: normalized.summary,
    profile_image: normalized.profile_image || '',
    skills: normalized.skills,
    experience: normalized.experience,
    education: normalized.education,
    projects: normalized.projects,
    certifications: normalized.certifications,
    template_id: normalized.template_id,
  };
}
