import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { ResumeData } from './supabase';
import { createEmptyResumeData, normalizeResumeData } from './resumeData';

GlobalWorkerOptions.workerSrc = pdfWorker;

const SECTION_HEADINGS = [
  'summary',
  'professional summary',
  'profile',
  'objective',
  'experience',
  'work experience',
  'professional experience',
  'employment',
  'employment history',
  'work history',
  'education',
  'skills',
  'strengths',
  'key achievements',
  'achievements',
  'languages',
  'technical skills',
  'projects',
  'certifications',
  'training',
  'training courses',
  'training courses certifications',
  'courses',
];

type ExtractionResult = {
  resumeData: ResumeData;
  rawText: string;
  score: number;
};

function cleanLine(line: string) {
  return line.replace(/\s+/g, ' ').replace(/\u0000/g, '').trim();
}

function normalizeForCompare(value: string) {
  return value.toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function startsWithHeading(line: string, heading: string) {
  const normalized = normalizeForCompare(line);
  return normalized === heading || normalized.startsWith(`${heading} `);
}

function isSectionHeading(line: string) {
  return SECTION_HEADINGS.some((heading) => startsWithHeading(line, heading));
}

function uniqueList(values: string[]) {
  return [...new Set(values.map((value) => cleanLine(value)).filter(Boolean))];
}

function splitListItems(lines: string[]) {
  return uniqueList(
    lines.flatMap((line) =>
      line
        .split(/(?:\s+[|•·]\s+)|,|(?:\s{2,})/)
        .map((part) => cleanLine(part))
        .filter((part) => part.length > 1)
    )
  );
}

function trimRepeatedWords(text: string) {
  const parts = text
    .split(/\s+/)
    .map((part) => cleanLine(part))
    .filter(Boolean);

  const compact: string[] = [];

  for (const part of parts) {
    if (compact[compact.length - 1]?.toLowerCase() === part.toLowerCase()) continue;
    compact.push(part);
  }

  return compact.join(' ');
}

function makeConciseText(text: string, options?: { maxChars?: number; maxSentences?: number }) {
  const maxChars = options?.maxChars ?? 280;
  const maxSentences = options?.maxSentences ?? 2;
  const compact = trimRepeatedWords(
    text
      .replace(/[•·]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );

  if (!compact) return '';

  const sentences = compact
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const selected = (sentences.length > 0 ? sentences : [compact]).slice(0, maxSentences).join(' ');
  if (selected.length <= maxChars) return selected;

  const shortened = selected.slice(0, maxChars).replace(/[,\s]+[^,\s]*$/, '').trim();
  return `${shortened}...`;
}

function splitIntoBlocks(lines: string[], matcher: RegExp) {
  const blocks: string[][] = [];
  let current: string[] = [];

  lines.forEach((line) => {
    if (!line) {
      if (current.length > 0) {
        blocks.push(current);
        current = [];
      }
      return;
    }

    if (matcher.test(line) && current.length > 0) {
      blocks.push(current);
      current = [line];
      return;
    }

    current.push(line);
  });

  if (current.length > 0) {
    blocks.push(current);
  }

  return blocks;
}

function getInlineSectionContent(line: string, headingMatchers: RegExp[]) {
  for (const matcher of headingMatchers) {
    const match = line.match(matcher);
    if (!match) continue;

    const consumed = match[0];
    const remainder = cleanLine(line.slice(consumed.length));
    return remainder;
  }

  return '';
}

function getSection(lines: string[], headingMatchers: RegExp[]) {
  const startIndex = lines.findIndex((line) => headingMatchers.some((matcher) => matcher.test(line)));
  if (startIndex === -1) return [];

  const sectionLines: string[] = [];
  const inlineStartContent = getInlineSectionContent(lines[startIndex], headingMatchers);

  if (inlineStartContent) {
    sectionLines.push(inlineStartContent);
  }

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line) {
      if (sectionLines.length > 0) {
        sectionLines.push('');
      }
      continue;
    }

    if (isSectionHeading(line) && sectionLines.length > 0) {
      break;
    }

    sectionLines.push(line);
  }

  return sectionLines;
}

function parseSummary(lines: string[]) {
  const summarySection = getSection(lines, [/^professional summary\b[:\-]?\s*/i, /^summary\b[:\-]?\s*/i, /^profile\b[:\-]?\s*/i, /^objective\b[:\-]?\s*/i]);
  if (summarySection.length === 0) return '';

  return makeConciseText(summarySection.filter(Boolean).join(' '), { maxChars: 260, maxSentences: 3 });
}

function parseSkills(lines: string[]) {
  const skillSection = getSection(lines, [/^skills\b[:\-]?\s*/i, /^technical skills\b[:\-]?\s*/i, /^core competencies\b[:\-]?\s*/i]);

  return splitListItems(skillSection.filter(Boolean));
}

function isEducationLine(line: string) {
  return /(?:\bmba\b|\bmaster\b|\bbachelor\b|\bb\.?com\b|\bb\.?tech\b|\bm\.?com\b|\bbba\b|\bbca\b|\bbsc\b|\bmsc\b|\bphd\b|\bdiploma\b|university|college|campus|school|institute|graduation|cgpa|gpa|aktu)/i.test(
    line
  );
}

function isExperienceLine(line: string) {
  return /(?:internship|intern|engineer|developer|manager|analyst|assistant|consultant|executive|specialist|coordinator|associate|worked|led|managed|developed|\(.+?\))/i.test(
    line
  );
}

function parseEducation(lines: string[]) {
  const educationSection = getSection(lines, [/^education\b[:\-]?\s*/i, /^academic background\b[:\-]?\s*/i]);
  const fallbackLines = educationSection.length > 0 ? educationSection : lines.filter((line) => isEducationLine(line));
  if (fallbackLines.length === 0) return [];

  const blocks = splitIntoBlocks(
    fallbackLines,
    /^(?:mba|master|bachelor|b\.?com|b\.?tech|m\.?com|bba|bca|bsc|msc|phd|doctor|diploma)/i
  )
    .map((block) => block.map(cleanLine).filter(Boolean))
    .filter((block) => block.length > 0);

  return blocks.map((block) => {
    const degreeLine = block[0] || '';
    const schoolLine =
      block.find((line, index) => index > 0 && /university|college|campus|school|institute|academy/i.test(line)) || block[1] || '';
    const dateMatch = block.join(' ').match(
      /(?:0?[1-9]|1[0-2])\/(?:19|20)\d{2}\s*-\s*(?:0?[1-9]|1[0-2])\/(?:19|20)\d{2}|\b(?:19|20)\d{2}\b(?:\s*-\s*(?:Present|Current|(?:19|20)\d{2}))?/i
    );

    return {
      degree: makeConciseText(degreeLine, { maxChars: 80, maxSentences: 1 }),
      school: makeConciseText(schoolLine, { maxChars: 90, maxSentences: 1 }),
      location: block.find((line) => /,\s*[A-Za-z]{2,}/.test(line) || /\bagra|delhi|mumbai|bangalore|india\b/i.test(line)) || '',
      graduationDate: dateMatch?.[0] || '',
      gpa: block.find((line) => /gpa/i.test(line))?.replace(/^.*gpa[:\s-]*/i, '') || '',
    };
  }).filter((item) => item.degree || item.school);
}

function parseExperience(lines: string[]) {
  const experienceSection = getSection(lines, [
    /^experience\b[:\-]?\s*/i,
    /^work experience\b[:\-]?\s*/i,
    /^professional experience\b[:\-]?\s*/i,
    /^employment history\b[:\-]?\s*/i,
    /^work history\b[:\-]?\s*/i,
  ]);

  if (experienceSection.length === 0) return [];

  const blocks = splitIntoBlocks(
    experienceSection.filter((line) => !isEducationLine(line)),
    /(?:internship|intern|engineer|developer|manager|analyst|assistant|consultant|executive|specialist|coordinator|\(.+?\))/i
  )
    .map((block) => block.map(cleanLine).filter(Boolean))
    .filter((block) => block.length > 0);

  return blocks.map((block) => {
    const header = block[0] || '';
    const secondLine = block.find((line, index) => index > 0 && !/\b(?:19|20)\d{2}\b|present|current/i.test(line)) || block[1] || '';
    const dateLine = block.find((line) => /\b(?:19|20)\d{2}\b|present|current/i.test(line)) || '';
    const titleCompanyMatch = header.includes('|')
      ? header.split('|').map((part) => cleanLine(part))
      : header.split(/\s+-\s+/).map((part) => cleanLine(part));
    const detailLines = block
      .slice(1)
      .filter((line) => line !== dateLine)
      .filter((line) => !isEducationLine(line));
    const internshipMatch = header.match(/^(.*?)\s*\(\s*(.*?)\s*\)\s*$/);
    const derivedTitle = internshipMatch
      ? internshipMatch[2].replace(/\b\d+\s*months?\b/gi, '').replace(/\(\s*\)/g, '').trim() || 'Internship'
      : '';
    const title = derivedTitle || titleCompanyMatch[0] || header;
    const company = internshipMatch
      ? internshipMatch[1].trim()
      : titleCompanyMatch[1] || (!/^(completed|selected|advanced|demonstrated|received|gained|involved|executed)\b/i.test(secondLine) ? secondLine : '');

    if (!isExperienceLine(title) && !isExperienceLine(company) && detailLines.length === 0) {
      return null;
    }

    return {
      title: makeConciseText(title, { maxChars: 70, maxSentences: 1 }),
      company: makeConciseText(company, { maxChars: 80, maxSentences: 1 }),
      location: block.find((line) => /,\s*[A-Za-z]{2,}/.test(line) && line !== dateLine) || '',
      startDate: dateLine.split(/\s*-\s*/)[0] || '',
      endDate: dateLine.split(/\s*-\s*/)[1] || '',
      current: /present|current/i.test(dateLine),
      description: detailLines
        .slice(0, 4)
        .map((line) => makeConciseText(line, { maxChars: 120, maxSentences: 1 }))
        .filter(Boolean)
        .join('\n'),
    };
  }).filter((item): item is NonNullable<typeof item> => Boolean(item)).filter((item) => item.title || item.company || item.description);
}

function parseCertifications(lines: string[]) {
  const certificationSection = getSection(lines, [
    /^certifications\b[:\-]?\s*/i,
    /^training\b[:\-]?\s*/i,
    /^training\s*\/\s*courses\b[:\-]?\s*/i,
    /^courses\b[:\-]?\s*/i,
  ]);
  if (certificationSection.length === 0) return [];

  return uniqueList(certificationSection.filter(Boolean)).map((line) => ({
    name: makeConciseText(line, { maxChars: 80, maxSentences: 1 }),
    issuer: '',
    date: '',
  }));
}

function pickName(lines: string[]) {
  const candidate = lines.find((line) => {
    if (!line) return false;
    if (line.length > 60) return false;
    if (/[0-9@]/.test(line)) return false;
    if (isSectionHeading(line)) return false;
    const words = line.split(/\s+/).filter(Boolean);
    return words.length >= 2 && words.length <= 5;
  });

  return candidate || '';
}

function pickLocation(lines: string[]) {
  const topContactMatch = lines
    .slice(0, 8)
    .find(
      (line) =>
        !/@/.test(line) &&
        !/\+?\d[\d\s()-]{7,}/.test(line) &&
        /,/.test(line) &&
        !/summary|experience|education|skills|strengths|achievements/i.test(line)
    );

  if (topContactMatch) return topContactMatch;

  return (
    lines.find(
      (line) =>
        !/@/.test(line) &&
        !/linkedin|github|portfolio|summary|experience|education|skills|strengths|achievements/i.test(line) &&
        /,/.test(line) &&
        !/[0-9]{5,}/.test(line)
    ) || ''
  );
}

function scoreExtraction(resumeData: ResumeData) {
  let score = 0;

  if (resumeData.name) score += 2;
  if (resumeData.email) score += 2;
  if (resumeData.phone) score += 2;
  if (resumeData.location) score += 1;
  if (resumeData.summary) score += 2;
  if (resumeData.skills.some((skill) => skill.trim())) score += 2;
  if (resumeData.experience.some((experience) => experience.title || experience.company || experience.description)) score += 3;
  if (resumeData.education.some((education) => education.degree || education.school)) score += 2;

  return score;
}

export async function extractTextFromPdf(file: File) {
  const buffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: buffer }).promise;
  const pageTexts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1 });
    const lineBuckets = new Map<number, Array<{ x: number; text: string }>>();

    textContent.items.forEach((item) => {
      if (!('str' in item)) return;
      const x = item.transform[4];
      const y = Math.round(item.transform[5]);
      const line = lineBuckets.get(y) || [];
      line.push({ x, text: item.str });
      lineBuckets.set(y, line);
    });

    const lines = [...lineBuckets.entries()]
      .map(([y, parts]) => ({
        y,
        x: Math.min(...parts.map((part) => part.x)),
        text: cleanLine(parts.sort((a, b) => a.x - b.x).map((part) => part.text).join(' ')),
      }))
      .filter((line) => line.text);

    const columnSplit = viewport.width * 0.52;
    const leftLines = lines.filter((line) => line.x < columnSplit).sort((a, b) => b.y - a.y);
    const rightLines = lines.filter((line) => line.x >= columnSplit).sort((a, b) => b.y - a.y);
    const useColumns = leftLines.length > 8 && rightLines.length > 8;
    const orderedLines = useColumns ? [...leftLines, ...rightLines] : lines.sort((a, b) => b.y - a.y);

    pageTexts.push(orderedLines.map((line) => line.text).join('\n'));
  }

  return pageTexts.join('\n\n');
}

export function extractResumeDataFromText(rawText: string, jobDescription = ''): ExtractionResult {
  const emptyResume = createEmptyResumeData(jobDescription);
  const cleanedText = rawText.replace(/\r/g, '\n');
  const lines = cleanedText
    .split('\n')
    .map(cleanLine)
    .filter((line, index, array) => !(line === '' && array[index - 1] === ''));

  const email = cleanedText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
  const phone =
    cleanedText.match(/(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3}[\s-]?\d{3,4}[\s-]?\d{3,4}/)?.[0] || '';

  const parsedEducation = parseEducation(lines);
  const parsed = normalizeResumeData(
    {
      ...emptyResume,
      name: pickName(lines),
      email,
      phone,
      location: pickLocation(lines),
      summary: parseSummary(lines),
      skills: parseSkills(lines),
      experience: parseExperience(lines),
      education: parsedEducation,
      certifications: parseCertifications(lines),
      extractionSource: 'upload',
    },
    jobDescription
  );

  const score = scoreExtraction(parsed);

  return {
    resumeData: parsed,
    rawText: cleanedText,
    score,
  };
}
