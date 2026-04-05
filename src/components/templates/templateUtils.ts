import { ResumeData } from '../../lib/supabase';

const BANNED_PHRASES = ['hardworking', 'quick learner'];
const FILLER_SKILLS = [
  'hardworking',
  'quick learner',
  'team player',
  'good communication skills',
  'communication skills',
  'dedicated',
  'adaptable',
  'self motivated',
  'self-motivated',
];
const DEMO_PROFILE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#dbeafe"/>
      <stop offset="100%" stop-color="#e0f2fe"/>
    </linearGradient>
  </defs>
  <rect width="240" height="240" rx="120" fill="url(#bg)"/>
  <circle cx="120" cy="90" r="44" fill="#94a3b8"/>
  <path d="M40 210c18-44 54-64 80-64s62 20 80 64" fill="#94a3b8"/>
</svg>`;
const DEMO_PROFILE_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(DEMO_PROFILE_SVG)}`;

function cleanPhrase(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function removeDuplicateSentences(text: string) {
  const seen = new Set<string>();
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => normalizeText(sentence))
    .filter(Boolean);

  return sentences
    .filter((sentence) => {
      const key = sentence.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(' ');
}

function stripBannedPhrases(text: string) {
  return BANNED_PHRASES.reduce(
    (result, phrase) => result.replace(new RegExp(`\\b${phrase}\\b`, 'gi'), '').replace(/\s+/g, ' ').trim(),
    text
  );
}

function limitSummary(text: string) {
  const cleaned = stripBannedPhrases(removeDuplicateSentences(text));
  if (cleaned.length <= 280) return cleaned;
  return `${cleaned.slice(0, 280).replace(/[,\s]+[^,\s]*$/, '').trim()}...`;
}

function dedupeList(values: string[]) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = value.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sentenceToKeywords(value: string) {
  const cleaned = stripBannedPhrases(value);

  if (!cleaned) return [];

  return cleaned
    .split(/,|\/|\||•|·/)
    .map((part) => normalizeText(part))
    .filter(Boolean)
    .flatMap((part) => {
      if (part.split(' ').length <= 4) return [part];
      return [];
    });
}

function extractJobKeywords(jobDescription: string, limit = 12) {
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
    'role',
    'team',
  ]);

  return dedupeList(
    matches
      .map((item) => normalizeText(item))
      .filter((item) => item.split(' ').length <= 4)
      .filter((item) => !stopWords.has(item.toLowerCase()))
  ).slice(0, limit);
}

function limitList<T>(items: T[], limit: number) {
  if (limit <= 0) return [];
  return items.slice(0, Math.max(1, limit));
}

function isKeywordSkill(value: string) {
  if (!value.trim()) return false;
  if (value.split(' ').length > 4) return false;
  if (/[.!?]$/.test(value.trim())) return false;
  return true;
}

export function prepareResumeForRender(data: ResumeData): ResumeData {
  const cleanedSkills = dedupeList(
    (data.skills || [])
      .flatMap((skill) => sentenceToKeywords(skill))
      .filter((skill) => skill && !/[.]/.test(skill))
  );

  const jobKeywords = extractJobKeywords(data.jobDescription || data.job_description || '');
  const resumeText = [
    data.summary,
    ...(data.experience || []).map((item) => `${item.title} ${item.company} ${item.description}`),
    ...(data.projects || []).map((item) => `${item.name} ${item.description}`),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const relevantKeywords = jobKeywords.filter((keyword) => resumeText.includes(keyword.toLowerCase()));
  const orderedSkills = dedupeList([...relevantKeywords, ...cleanedSkills])
    .filter((skill) => !FILLER_SKILLS.includes(skill.toLowerCase()))
    .filter((skill) => isKeywordSkill(skill))
    .slice(0, 16);

  const cleanedExperience = (data.experience || []).map((item) => ({
    ...item,
    description: stripBannedPhrases(removeDuplicateSentences(item.description || '')),
  }));

  return {
    ...data,
    summary: limitSummary(data.summary || ''),
    skills: orderedSkills,
    experience: cleanedExperience,
    education: limitList(data.education || [], 3),
    projects: limitList(data.projects || [], 4),
    certifications: limitList(data.certifications || [], 6).map((item) => ({
      ...item,
      name: normalizeText(stripBannedPhrases(item.name || '')),
      issuer: normalizeText(item.issuer || ''),
      date: normalizeText(item.date || ''),
    })),
  };
}

export function hasSummary(data: ResumeData) {
  return Boolean(data.summary?.trim());
}

export function getVisibleSkills(data: ResumeData) {
  return dedupeList(
    (data.skills || [])
      .map((skill) => skill.trim())
      .filter(Boolean)
      .filter((skill) => !FILLER_SKILLS.includes(skill.toLowerCase()))
      .filter((skill) => !BANNED_PHRASES.includes(skill.toLowerCase()))
      .filter((skill) => isKeywordSkill(skill))
  );
}

export function getVisibleExperience(data: ResumeData) {
  return (data.experience || []).filter(
    (item) => item.title?.trim() || item.company?.trim() || item.description?.trim()
  );
}

export function getVisibleEducation(data: ResumeData) {
  return (data.education || []).filter((item) => item.degree?.trim() || item.school?.trim());
}

export function getVisibleProjects(data: ResumeData) {
  return (data.projects || []).filter((item) => item.name?.trim() || item.description?.trim());
}

export function getVisibleCertifications(data: ResumeData) {
  return (data.certifications || []).filter((item) => item.name?.trim() || item.issuer?.trim() || item.date?.trim());
}

function trimBullet(text: string, maxChars = 160) {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars).replace(/[,\s]+[^,\s]*$/, '').trim()}...`;
}

export function getDescriptionPoints(description?: string, maxPoints = 4) {
  if (!description?.trim()) return [];

  const normalized = stripBannedPhrases(removeDuplicateSentences(description))
    .replace(/\n+/g, '. ')
    .replace(/[•·]/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();

  const pieces = normalized
    .split(/(?<=[.!?])\s+|;\s+/)
    .map((piece) => piece.trim().replace(/^[.-\s]+/, ''))
    .filter(Boolean);

  const points = (pieces.length > 0 ? pieces : [normalized]).slice(0, Math.min(maxPoints, 4));
  return points
    .map((point) => point.replace(/[.]+$/, ''))
    .map((point) => trimBullet(point));
}

export function getProfileImageSrc(profileImage?: string) {
  if (profileImage?.trim()) return profileImage;
  return DEMO_PROFILE_IMAGE;
}

function trimDescriptionToSentences(description: string, maxSentences: number) {
  if (!description.trim()) return '';
  const normalized = stripBannedPhrases(removeDuplicateSentences(description))
    .replace(/\n+/g, '. ')
    .replace(/[•·]/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
  const sentences = normalized.split(/(?<=[.!?])\s+|;\s+/).filter(Boolean);
  return sentences.slice(0, Math.max(1, maxSentences)).join(' ');
}

export function compactResumeData(data: ResumeData, level: number): ResumeData {
  if (level <= 0) return data;

  const summary =
    level >= 4
      ? limitSummary(trimDescriptionToSentences(data.summary || '', 1))
      : level >= 3
        ? limitSummary(trimDescriptionToSentences(data.summary || '', 1))
        : level >= 2
          ? limitSummary(trimDescriptionToSentences(data.summary || '', 2))
          : limitSummary(trimDescriptionToSentences(data.summary || '', 3));

  const experienceLimit = data.experience?.length || 0;
  const baseBullets = level >= 4 ? 1 : level >= 3 ? 1 : level >= 2 ? 2 : 3;
  const skillsLimit = level >= 4 ? 8 : level >= 3 ? 10 : level >= 2 ? 12 : 14;
  const educationLimit = level >= 4 ? 1 : level >= 3 ? 2 : level >= 2 ? 2 : 3;
  const certificationLimit = level >= 4 ? 0 : level >= 3 ? 3 : level >= 2 ? 4 : 6;
  const projectLimit = level >= 4 ? 0 : level >= 3 ? 1 : level >= 2 ? 2 : 3;

  return {
    ...data,
    summary,
    skills: (data.skills || []).slice(0, skillsLimit),
    experience: (data.experience || []).slice(0, experienceLimit).map((item, index) => {
      const bulletSentences = Math.max(1, baseBullets - Math.floor(index / 2));
      return {
        ...item,
        description: trimDescriptionToSentences(item.description || '', bulletSentences),
      };
    }),
    education: (data.education || []).slice(0, educationLimit),
    certifications: (data.certifications || []).slice(0, certificationLimit),
    projects: (data.projects || []).slice(0, projectLimit),
  };
}
