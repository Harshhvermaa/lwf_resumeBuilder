import { Briefcase, FolderOpen, Mail, MapPin, Phone, Sparkles } from 'lucide-react';
import { ResumeData } from '../../lib/supabase';
import {
  getDescriptionPoints,
  getProfileImageSrc,
  getVisibleCertifications,
  getVisibleEducation,
  getVisibleExperience,
  getVisibleProjects,
  getVisibleSkills,
  hasSummary,
} from './templateUtils';

interface TemplateProps {
  data: ResumeData;
}

function truncateSummary(summary?: string) {
  if (!summary?.trim()) return '';
  const trimmed = summary.trim();
  if (trimmed.length <= 180) return trimmed;
  return `${trimmed.slice(0, 180).replace(/\s+\S*$/, '')}...`;
}

export default function SpotlightResumeTemplate({ data }: TemplateProps) {
  const skills = getVisibleSkills(data);
  const experience = getVisibleExperience(data);
  const education = getVisibleEducation(data);
  const projects = getVisibleProjects(data);
  const certifications = getVisibleCertifications(data);
  const profileImageSrc = getProfileImageSrc(data.profile_image);
  const role = data.experience?.[0]?.title || 'Copywriter';
  const summary = truncateSummary(data.summary);
  const primaryProjects = projects.slice(0, 3);
  const interestProjects = projects.slice(3, 6);

  return (
    <div className="bg-white w-full min-h-full">
      <div className="relative min-h-[1123px]">
        <div className="grid grid-cols-[1.05fr_0.95fr]">
          <div className="px-8 pt-8">
            <div className="rounded-2xl bg-slate-800 px-6 py-5 text-white shadow-sm">
              <h1 className="text-2xl font-black">{data.name || 'Your Name'}</h1>
              <p className="mt-1 text-sm font-semibold text-amber-300">{role}</p>
              {hasSummary(data) && (
                <p className="mt-3 text-xs leading-6 text-slate-200">{summary}</p>
              )}
            </div>
          </div>
          <div className="px-8 pt-10 text-right">
            <div className="space-y-2 text-xs text-slate-500">
              {data.email && (
                <div className="flex items-center justify-end gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>{data.email}</span>
                </div>
              )}
              {data.phone && (
                <div className="flex items-center justify-end gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{data.phone}</span>
                </div>
              )}
              {data.location && (
                <div className="flex items-center justify-end gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{data.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="absolute left-1/2 top-[112px] flex -translate-x-1/2 flex-col items-center">
          <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-lg">
            <img src={profileImageSrc} alt="Profile" className="h-full w-full object-cover" />
          </div>
          <div className="mt-2 h-3 w-3 rotate-45 bg-amber-400" />
        </div>

        <div className="grid grid-cols-[1.05fr_0.95fr]">
          <section className="px-8 pt-16 pb-10">
            {experience.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Briefcase className="h-4 w-4 text-slate-700" />
                  Work Experience
                </div>
                <div className="mt-4 space-y-6">
                  {experience.map((exp, index) => (
                    <div key={index} className="resume-item">
                      <div className="flex items-start justify-between gap-6">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{exp.title}</h3>
                          <p className="text-xs font-semibold text-slate-600">{exp.company}</p>
                        </div>
                        <div className="text-xs text-slate-500 text-right">
                          <p>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                        </div>
                      </div>
                      {getDescriptionPoints(exp.description, 3).length > 0 && (
                        <ul className="mt-3 space-y-1 text-xs text-slate-600">
                          {getDescriptionPoints(exp.description, 3).map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="mt-2 h-1 w-1 rounded-full bg-amber-400" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {education.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Sparkles className="h-4 w-4 text-slate-700" />
                  Education
                </div>
                <div className="mt-4 space-y-4">
                  {education.map((edu, index) => (
                    <div key={index} className="flex items-start justify-between gap-6">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{edu.degree}</p>
                        <p className="text-xs text-slate-600">{edu.school}</p>
                      </div>
                      <div className="text-xs text-slate-500 text-right">{edu.graduationDate}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <aside className="bg-slate-50 px-8 pt-16 pb-10">
            {skills.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">General Skills</h3>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  {skills.slice(0, 10).map((skill, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-400" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {primaryProjects.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
                  <FolderOpen className="h-3.5 w-3.5 text-slate-500" />
                  Personal Projects
                </div>
                <div className="mt-3 space-y-3 text-xs text-slate-600">
                  {primaryProjects.map((project, index) => (
                    <div key={index}>
                      <p className="font-semibold text-slate-800">{project.name}</p>
                      {project.description && <p className="mt-1">{project.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {certifications.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">Languages</h3>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  {certifications.slice(0, 6).map((cert, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                      <span>{cert.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {interestProjects.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">Interests</h3>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
                  {interestProjects.map((project, index) => (
                    <span key={index} className="rounded-full border border-slate-200 bg-white px-3 py-1">
                      {project.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
