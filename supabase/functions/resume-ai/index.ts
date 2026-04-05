import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const configuredModel = Deno.env.get('OPENAI_MODEL') || 'gpt-4o';
const model =
  configuredModel === 'gpt-4o'
    ? 'gpt-4o-2024-08-06'
    : configuredModel === 'gpt-4o-mini'
      ? 'gpt-4o-mini-2024-07-18'
      : configuredModel;
const openAiKey = Deno.env.get('OPENAI_API_KEY');

const resumeSchema = {
  name: 'resume_data',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: [
      'job_description',
      'name',
      'email',
      'phone',
      'location',
      'summary',
      'skills',
      'experience',
      'education',
      'projects',
      'certifications',
      'template_id',
    ],
    properties: {
      job_description: { type: 'string' },
      name: { type: 'string' },
      email: { type: 'string' },
      phone: { type: 'string' },
      location: { type: 'string' },
      summary: { type: 'string' },
      skills: {
        type: 'array',
        items: { type: 'string' },
      },
      experience: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['title', 'company', 'location', 'startDate', 'endDate', 'current', 'description'],
          properties: {
            title: { type: 'string' },
            company: { type: 'string' },
            location: { type: 'string' },
            startDate: { type: 'string' },
            endDate: { type: 'string' },
            current: { type: 'boolean' },
            description: { type: 'string' },
          },
        },
      },
      education: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['degree', 'school', 'location', 'graduationDate', 'gpa'],
          properties: {
            degree: { type: 'string' },
            school: { type: 'string' },
            location: { type: 'string' },
            graduationDate: { type: 'string' },
            gpa: { type: 'string' },
          },
        },
      },
      projects: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['name', 'description', 'technologies', 'link'],
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            technologies: {
              type: 'array',
              items: { type: 'string' },
            },
            link: { type: 'string' },
          },
        },
      },
      certifications: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['name', 'issuer', 'date'],
          properties: {
            name: { type: 'string' },
            issuer: { type: 'string' },
            date: { type: 'string' },
          },
        },
      },
      template_id: { type: 'string' },
    },
  },
};

const summarySchema = {
  name: 'resume_summary',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['summary'],
    properties: {
      summary: { type: 'string' },
    },
  },
};

const experienceSchema = {
  name: 'resume_experience',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['experienceDescription'],
    properties: {
      experienceDescription: { type: 'string' },
    },
  },
};

const keywordSchema = {
  name: 'job_keywords',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['target_role', 'keywords'],
    properties: {
      target_role: { type: 'string' },
      keywords: {
        type: 'array',
        items: { type: 'string' },
      },
    },
  },
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

async function callOpenAI(
  messages: Array<{ role: 'system' | 'user'; content: string }>,
  schema = resumeSchema
) {
  if (!openAiKey) {
    throw new Error('Missing OPENAI_API_KEY secret');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: schema,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  const message = payload.choices?.[0]?.message;

  if (!message) {
    throw new Error('OpenAI response did not include a message');
  }

  if (message.refusal) {
    throw new Error(`OpenAI refused the request: ${message.refusal}`);
  }

  const content = Array.isArray(message.content)
    ? message.content
        .map((part: { type?: string; text?: string }) => (part?.type === 'text' ? part.text || '' : ''))
        .join('')
    : message.content;
  if (!content) {
    throw new Error('OpenAI response content was empty');
  }

  return JSON.parse(content);
}

function getResumeWriterSystemPrompt() {
  return [
    'You are an expert ATS resume writer.',
    'Your job is to rewrite a candidate’s resume so it is optimized for a specific job description.',
    'Rules:',
    '* Do NOT invent fake experience or data',
    '* Improve wording using strong action verbs',
    '* Make bullet points achievement-oriented',
    '* Extract important keywords from job description',
    '* Add relevant keywords ONLY if they match candidate background',
    '* Remove generic phrases like "hardworking", "quick learner"',
    '* Keep content concise and ATS-friendly',
    '* Do NOT repeat content',
    '* Improve clarity, impact, and professionalism',
    'Return ONLY structured JSON that matches the provided schema.',
  ].join('\n');
}

function getResumeTailorSystemPrompt() {
  return [
    'You are an expert ATS resume writer tailoring an existing resume to a specific job description.',
    'Your task is to return a stronger, job-specific version of the resume in structured JSON.',
    'Hard requirements:',
    '* Rewrite the summary specifically for the target role and job description.',
    '* The summary must be concise, professional, and 2-4 sentences maximum.',
    '* Rewrite the skills section into 6-12 ATS-style keywords only, not sentences.',
    '* Prioritize keywords from the job description only when they are genuinely supported by the candidate background.',
    '* Remove generic or weak skills such as "hardworking", "quick learner", or full sentence traits.',
    '* Keep experience factual, but improve wording with stronger action verbs and more relevant phrasing.',
    '* Do NOT invent tools, experience, achievements, or education details that are not supported.',
    '* Reduce repetition and remove content that is irrelevant to the target role.',
    '* Keep education and certifications factual and cleanly separated.',
    'Return ONLY structured JSON that matches the provided schema.',
  ].join('\n');
}

function getSummaryWriterSystemPrompt() {
  return [
    'You are an expert ATS resume writer.',
    'Write only a concise, professional summary for the candidate.',
    '* If a job description is provided, align the summary to that target role.',
    '* If no job description is provided, use the supplied context to write a strong summary.',
    '* Keep it to 2-4 sentences.',
    '* Do not invent facts.',
    'Return ONLY structured JSON matching the schema.',
  ].join('\n');
}

function getExperienceWriterSystemPrompt() {
  return [
    'You are an expert ATS resume writer.',
    'Rewrite only the provided experience description.',
    '* Use concise, achievement-oriented resume language.',
    '* Keep the content factual.',
    '* If a job description is provided, make the wording more relevant to that role.',
    '* Output 2-4 short bullet-style lines as a single string.',
    'Return ONLY structured JSON matching the schema.',
  ].join('\n');
}

function dedupeStrings(values: unknown[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  values.forEach((value) => {
    if (typeof value !== 'string') return;
    const cleaned = value.replace(/\s+/g, ' ').trim();
    if (!cleaned) return;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    result.push(cleaned);
  });

  return result;
}

function sanitizeExperience(items: unknown[]) {
  return items
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const entry = item as Record<string, unknown>;
      return {
        title: typeof entry.title === 'string' ? entry.title.trim() : '',
        company: typeof entry.company === 'string' ? entry.company.trim() : '',
        location: typeof entry.location === 'string' ? entry.location.trim() : '',
        startDate: typeof entry.startDate === 'string' ? entry.startDate.trim() : '',
        endDate: typeof entry.endDate === 'string' ? entry.endDate.trim() : '',
        current: Boolean(entry.current),
        description: typeof entry.description === 'string' ? entry.description.replace(/\s+/g, ' ').trim() : '',
      };
    })
    .filter((item) => item.title || item.company || item.description);
}

function sanitizeEducation(items: unknown[]) {
  return items
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const entry = item as Record<string, unknown>;
      return {
        degree: typeof entry.degree === 'string' ? entry.degree.trim() : '',
        school: typeof entry.school === 'string' ? entry.school.trim() : '',
        location: typeof entry.location === 'string' ? entry.location.trim() : '',
        graduationDate: typeof entry.graduationDate === 'string' ? entry.graduationDate.trim() : '',
        gpa: typeof entry.gpa === 'string' ? entry.gpa.trim() : '',
      };
    })
    .filter((item) => item.degree || item.school);
}

function sanitizeProjects(items: unknown[]) {
  return items
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const entry = item as Record<string, unknown>;
      return {
        name: typeof entry.name === 'string' ? entry.name.trim() : '',
        description: typeof entry.description === 'string' ? entry.description.replace(/\s+/g, ' ').trim() : '',
        technologies: Array.isArray(entry.technologies) ? dedupeStrings(entry.technologies) : [],
        link: typeof entry.link === 'string' ? entry.link.trim() : '',
      };
    })
    .filter((item) => item.name || item.description);
}

function sanitizeCertifications(items: unknown[]) {
  return items
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const entry = item as Record<string, unknown>;
      return {
        name: typeof entry.name === 'string' ? entry.name.trim() : '',
        issuer: typeof entry.issuer === 'string' ? entry.issuer.trim() : '',
        date: typeof entry.date === 'string' ? entry.date.trim() : '',
      };
    })
    .filter((item) => item.name || item.issuer || item.date);
}

function buildStructuredResumeInput(resumeData: Record<string, unknown>, jobDescription: string, targetRole: string) {
  return {
    personal_info: {
      name: typeof resumeData.name === 'string' ? resumeData.name : '',
      email: typeof resumeData.email === 'string' ? resumeData.email : '',
      phone: typeof resumeData.phone === 'string' ? resumeData.phone : '',
      location: typeof resumeData.location === 'string' ? resumeData.location : '',
    },
    summary: typeof resumeData.summary === 'string' ? resumeData.summary : '',
    experience: Array.isArray(resumeData.experience) ? resumeData.experience : [],
    education: Array.isArray(resumeData.education) ? resumeData.education : [],
    skills: Array.isArray(resumeData.skills) ? resumeData.skills : [],
    certifications: Array.isArray(resumeData.certifications) ? resumeData.certifications : [],
    job_description: jobDescription || '',
    target_role: targetRole || '',
  };
}

async function extractKeywords(jobDescription: string) {
  if (!jobDescription.trim()) {
    return { target_role: '', keywords: [] as string[] };
  }

  const result = await callOpenAI(
    [
      {
        role: 'system',
        content: [
          'Extract the top 10-15 ATS keywords from the job description.',
          'Also identify the target role.',
          'Return JSON only.',
        ].join(' '),
      },
      {
        role: 'user',
        content: jobDescription,
      },
    ],
    keywordSchema
  );

  return {
    target_role: typeof result.target_role === 'string' ? result.target_role.trim() : '',
    keywords: Array.isArray(result.keywords) ? dedupeStrings(result.keywords).slice(0, 15) : [],
  };
}

function sanitizeResumeData(input: Record<string, unknown>) {
  return {
    job_description: typeof input.job_description === 'string' ? input.job_description : '',
    name: typeof input.name === 'string' ? input.name : '',
    email: typeof input.email === 'string' ? input.email : '',
    phone: typeof input.phone === 'string' ? input.phone : '',
    location: typeof input.location === 'string' ? input.location : '',
    summary: typeof input.summary === 'string' ? input.summary.replace(/\s+/g, ' ').trim() : '',
    skills: Array.isArray(input.skills) ? dedupeStrings(input.skills) : [],
    experience: Array.isArray(input.experience) ? sanitizeExperience(input.experience) : [],
    education: Array.isArray(input.education) ? sanitizeEducation(input.education) : [],
    projects: Array.isArray(input.projects) ? sanitizeProjects(input.projects) : [],
    certifications: Array.isArray(input.certifications) ? sanitizeCertifications(input.certifications) : [],
    template_id: typeof input.template_id === 'string' && input.template_id ? input.template_id : 'modern',
  };
}

serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, rawText, resumeData, jobDescription = '', experienceIndex, contextNote = '' } = await request.json();

    if (action === 'extract') {
      if (!rawText || typeof rawText !== 'string') {
        return jsonResponse({ error: 'Missing rawText' }, 400);
      }

      const keywordData = await extractKeywords(jobDescription);

      const extracted = await callOpenAI([
        {
          role: 'system',
          content: getResumeWriterSystemPrompt(),
        },
        {
          role: 'user',
          content: JSON.stringify({
            instruction: 'Extract the candidate resume from raw PDF text and return structured resume JSON.',
            raw_resume_text: rawText,
            job_description: jobDescription || '',
            target_role: keywordData.target_role,
            job_keywords: keywordData.keywords,
          }),
        },
      ]);

      return jsonResponse({
        resumeData: sanitizeResumeData({
          ...extracted,
          job_description: jobDescription,
          template_id: extracted.template_id || 'modern',
        }),
      });
    }

    if (action === 'tailor') {
      if (!resumeData || typeof resumeData !== 'object') {
        return jsonResponse({ error: 'Missing resumeData' }, 400);
      }

      const keywordData = await extractKeywords(jobDescription);
      const structuredInput = buildStructuredResumeInput(
        resumeData as Record<string, unknown>,
        jobDescription,
        keywordData.target_role
      );

      const tailored = await callOpenAI([
        {
          role: 'system',
          content: getResumeTailorSystemPrompt(),
        },
        {
          role: 'user',
          content: JSON.stringify({
            instruction:
              'Rewrite this uploaded resume so the summary, skills, and experience are clearly aligned with the job description while staying fully truthful to the candidate background.',
            ...structuredInput,
            job_keywords: keywordData.keywords,
          }),
        },
      ]);

      return jsonResponse({
        resumeData: sanitizeResumeData({
          ...tailored,
          job_description: jobDescription || resumeData.job_description || '',
          template_id: resumeData.template_id || tailored.template_id || 'modern',
        }),
      });
    }

    if (action === 'summary') {
      if (!resumeData || typeof resumeData !== 'object') {
        return jsonResponse({ error: 'Missing resumeData' }, 400);
      }

      const keywordData = await extractKeywords(jobDescription);

      const summaryResult = await callOpenAI(
        [
          {
            role: 'system',
            content: getSummaryWriterSystemPrompt(),
          },
          {
            role: 'user',
            content: JSON.stringify({
              task:
                'Generate only the resume summary. If no job description is provided, use the context note to create a professional summary from the user background.',
              ...buildStructuredResumeInput(resumeData as Record<string, unknown>, jobDescription, keywordData.target_role),
              context_note: typeof contextNote === 'string' ? contextNote : '',
              job_keywords: keywordData.keywords,
            }),
          },
        ],
        summarySchema
      );

      return jsonResponse({ summary: summaryResult.summary });
    }

    if (action === 'experience') {
      if (!resumeData || typeof resumeData !== 'object') {
        return jsonResponse({ error: 'Missing resumeData' }, 400);
      }

      const index = Number.isInteger(experienceIndex) ? experienceIndex : -1;
      const selectedExperience = Array.isArray(resumeData.experience) ? resumeData.experience[index] : null;

      if (!selectedExperience) {
        return jsonResponse({ error: 'Missing experience entry' }, 400);
      }

      const keywordData = await extractKeywords(jobDescription);

      const experienceResult = await callOpenAI(
        [
          {
            role: 'system',
            content: getExperienceWriterSystemPrompt(),
          },
          {
            role: 'user',
            content: JSON.stringify({
              task:
                'Rewrite only this experience description as concise ATS-friendly resume content. If no job description is provided, use the context note to make it professional and specific without inventing facts.',
              job_description: jobDescription || '',
              target_role: keywordData.target_role,
              job_keywords: keywordData.keywords,
              context_note: typeof contextNote === 'string' ? contextNote : '',
              experience: selectedExperience,
            }),
          },
        ],
        experienceSchema
      );

      return jsonResponse({ experienceDescription: experienceResult.experienceDescription });
    }

    return jsonResponse({ error: 'Unsupported action' }, 400);
  } catch (error) {
    console.error(error);
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});
