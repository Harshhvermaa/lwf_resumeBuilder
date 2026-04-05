import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ResumeData {
  id?: string;
  user_id?: string;
  job_description: string;
  jobDescription?: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  profile_image?: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    location: string;
    graduationDate: string;
    gpa?: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  aiMeta?: {
    summaryEnhanced?: boolean;
    skillsAdded?: string[];
    experienceEnhanced?: number[];
  };
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  template_id: string;
  extractionStatus?: 'idle' | 'success' | 'partial' | 'failed';
  extractionError?: string;
  extractionSource?: 'upload' | 'scratch';
  created_at?: string;
  updated_at?: string;
}
