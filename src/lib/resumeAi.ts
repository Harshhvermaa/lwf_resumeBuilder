import { ResumeData, supabase } from './supabase';
import { normalizeResumeData } from './resumeData';

type ResumeAiAction = 'extract' | 'tailor';
type ResumeDraftAction = 'summary' | 'experience';

interface ResumeAiPayload {
  action: ResumeAiAction | ResumeDraftAction;
  rawText?: string;
  resumeData?: ResumeData;
  jobDescription?: string;
  experienceIndex?: number;
  contextNote?: string;
  rules?: string;
  targetRole?: string;
}

interface ResumeAiResponse {
  resumeData?: ResumeData;
  summary?: string;
  experienceDescription?: string;
}

function cleanPhrase(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function dedupeList(values: string[]) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = cleanPhrase(value).toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getTopSkills(resumeData: ResumeData, limit = 4) {
  return dedupeList((resumeData.skills || []).map((skill) => cleanPhrase(skill))).slice(0, limit);
}

function getRoleHint(resumeData: ResumeData) {
  const currentRole = resumeData.experience.find((item) => cleanPhrase(item.title))?.title;
  if (currentRole) return cleanPhrase(currentRole);

  const degree = resumeData.education.find((item) => cleanPhrase(item.degree))?.degree;
  if (degree) return cleanPhrase(degree);

  return 'professional';
}

const ATS_RULES = [
  'Job-description-first optimization. Prioritize relevance.',
  'Rewrite summary (3-4 lines), skills, and experience bullets.',
  'Keep all companies; do not invent experiences, achievements, tools, or certifications.',
  'Skills must be ATS-friendly keywords only; remove filler like hardworking, quick learner, dedicated.',
  'Use 2-4 concise, action-verb bullets per role.',
  'Keep chronology correct. Do not reorder companies.',
  'Keep content concise to fit one page.'
].join(' ');

function getExperienceHighlights(resumeData: ResumeData) {
  const roles = resumeData.experience
    .map((item) => [item.title, item.company].map((value) => cleanPhrase(value || '')).filter(Boolean).join(' at '))
    .filter(Boolean);
  return dedupeList(roles).slice(0, 2);
}

function extractJobKeywords(jobDescription: string, limit = 4) {
  const normalized = cleanPhrase(jobDescription);
  if (!normalized) return [];

  const matches = normalized.match(/[A-Za-z][A-Za-z&/+\-. ]{2,}/g) || [];
  const stopWords = new Set([
    'and',
    'with',
    'for',
    'the',
    'you',
    'your',
    'our',
    'are',
    'will',
    'this',
    'that',
    'from',
    'have',
    'has',
    'using',
    'ability',
    'experience',
    'preferred',
    'required',
    'candidate',
    'responsibilities',
    'qualification',
    'qualifications',
  ]);

  return dedupeList(
    matches
      .map((item) => cleanPhrase(item))
      .filter((item) => item.split(' ').length <= 4)
      .filter((item) => !stopWords.has(item.toLowerCase()))
  ).slice(0, limit);
}

export function generateSummaryFallback(resumeData: ResumeData, jobDescription = '', contextNote = '') {
  const roleHint = getRoleHint(resumeData);
  const topSkills = getTopSkills(resumeData, 3);
  const experienceHighlights = getExperienceHighlights(resumeData);
  const jdKeywords = extractJobKeywords(jobDescription, 3);
  const context = cleanPhrase(contextNote);

  const sentences: string[] = [];

  if (topSkills.length) {
    sentences.push(`${roleHint} with strengths in ${topSkills.join(', ')} and a focus on clear, results-driven work.`);
  } else {
    sentences.push(`${roleHint} with a developing background and a strong focus on professional, well-structured work.`);
  }

  if (experienceHighlights.length) {
    sentences.push(`Background includes ${experienceHighlights.join(' and ')}, with experience contributing to day-to-day execution and team goals.`);
  } else if (context) {
    sentences.push(context);
  }

  if (jdKeywords.length) {
    sentences.push(`Prepared to contribute in areas such as ${jdKeywords.join(', ')} while keeping the resume aligned with the target role.`);
  } else if (context) {
    sentences.push(`Brings ${context.charAt(0).toLowerCase()}${context.slice(1)} into a concise professional profile.`);
  }

  return sentences.slice(0, 3).join(' ');
}

export function generateExperienceFallback(
  resumeData: ResumeData,
  experienceIndex: number,
  jobDescription = '',
  contextNote = ''
) {
  const experience = resumeData.experience[experienceIndex];
  if (!experience) return '';

  const title = cleanPhrase(experience.title || 'role');
  const company = cleanPhrase(experience.company || 'the organization');
  const location = cleanPhrase(experience.location || '');
  const context = cleanPhrase(contextNote || experience.description || '');
  const keywords = extractJobKeywords(jobDescription, 3);
  const bullets: string[] = [];

  bullets.push(`Supported ${title.toLowerCase()} responsibilities at ${company}${location ? ` in ${location}` : ''}.`);

  if (context) {
    bullets.push(
      `Contributed to ${context.replace(/^[a-z]/, (char) => char.toLowerCase())}, while maintaining clear communication and organized execution.`
    );
  }

  if (keywords.length) {
    bullets.push(`Aligned day-to-day work with priorities such as ${keywords.join(', ')} where relevant to the role.`);
  } else {
    bullets.push('Delivered work in a concise, professional format that highlights practical contributions and team support.');
  }

  return bullets.slice(0, 3).join('\n');
}

async function invokeResumeAi(payload: ResumeAiPayload) {
  const { data, error } = await supabase.functions.invoke<ResumeAiResponse>('resume-ai', {
    body: payload,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function extractResumeWithAI(rawText: string, jobDescription = '') {
  const data = await invokeResumeAi({
    action: 'extract',
    rawText,
    jobDescription,
    rules: ATS_RULES,
  });

  if (!data?.resumeData) {
    throw new Error('AI function returned no resume data');
  }

  return normalizeResumeData(data.resumeData, jobDescription);
}

export async function tailorResumeWithAI(resumeData: ResumeData, jobDescription = '') {
  const data = await invokeResumeAi({
    action: 'tailor',
    resumeData,
    jobDescription,
    rules: ATS_RULES,
    targetRole: getRoleHint(resumeData),
  });

  if (!data?.resumeData) {
    throw new Error('AI function returned no resume data');
  }

  return normalizeResumeData(data.resumeData, jobDescription);
}

export async function generateSummaryWithAI(resumeData: ResumeData, jobDescription = '') {
  const data = await invokeResumeAi({
    action: 'summary',
    resumeData,
    jobDescription,
    rules: ATS_RULES,
    targetRole: getRoleHint(resumeData),
  });

  if (!data?.summary) {
    throw new Error('AI function returned no summary');
  }

  return data.summary;
}

export async function improveExperienceWithAI(
  resumeData: ResumeData,
  experienceIndex: number,
  jobDescription = '',
  contextNote = ''
) {
  const data = await invokeResumeAi({
    action: 'experience',
    resumeData,
    experienceIndex,
    jobDescription,
    contextNote: `${contextNote} ${ATS_RULES}`.trim(),
    rules: ATS_RULES,
    targetRole: getRoleHint(resumeData),
  });

  if (!data?.experienceDescription) {
    throw new Error('AI function returned no experience description');
  }

  return data.experienceDescription;
}

export async function generateSummaryFromContext(
  resumeData: ResumeData,
  contextNote: string,
  jobDescription = ''
) {
  const data = await invokeResumeAi({
    action: 'summary',
    resumeData,
    jobDescription,
    contextNote: `${contextNote} ${ATS_RULES}`.trim(),
    rules: ATS_RULES,
    targetRole: getRoleHint(resumeData),
  });

  if (!data?.summary) {
    throw new Error('AI function returned no summary');
  }

  return data.summary;
}
