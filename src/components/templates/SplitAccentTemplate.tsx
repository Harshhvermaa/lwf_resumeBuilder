import { Mail, MapPin, Phone } from 'lucide-react';
import { ResumeData } from '../../lib/supabase';
import {
  getDescriptionPoints,
  getVisibleEducation,
  getVisibleExperience,
  getVisibleProjects,
  getVisibleSkills,
  getProfileImageSrc,
  hasSummary,
} from './templateUtils';

interface TemplateProps {
  data: ResumeData;
}

export default function SplitAccentTemplate({ data }: TemplateProps) {
  const skills = getVisibleSkills(data);
  const experience = getVisibleExperience(data);
  const education = getVisibleEducation(data);
  const projects = getVisibleProjects(data);
  const profileImageSrc = getProfileImageSrc(data.profile_image);

  return (
    <div className="bg-white w-full min-h-full">
      <div className="grid grid-cols-[280px_1fr] min-h-[1123px]">
        <aside className="bg-slate-900 text-white px-6 py-8">
          <div className="flex flex-col items-center">
            <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white/70 bg-slate-700">
              <img src={profileImageSrc} alt="Profile" className="h-full w-full object-cover" />
            </div>
          </div>

          <div className="mt-8 space-y-6 text-sm text-slate-200">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Contact</h3>
              <div className="mt-3 space-y-2">
                {data.location && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span>{data.location}</span>
                  </div>
                )}
                {data.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 mt-0.5" />
                    <span>{data.phone}</span>
                  </div>
                )}
                {data.email && (
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 mt-0.5" />
                    <span>{data.email}</span>
                  </div>
                )}
              </div>
            </div>

            {skills.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Skills</h3>
                <ul className="mt-3 space-y-2">
                  {skills.map((skill, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {projects.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Interests</h3>
                <ul className="mt-3 space-y-2">
                  {projects.map((project, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-300" />
                      <span>{project.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>

        <section className="px-10 py-10">
          <div className="border-b border-slate-200 pb-5">
            <h1 className="text-3xl font-black text-slate-900">{data.name || 'Your Name'}</h1>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 mt-1">
              {data.experience?.[0]?.title || 'Professional'}
            </p>
          </div>

          {hasSummary(data) && (
            <div className="mt-6">
              <h2 className="text-lg font-bold text-slate-900">Profile</h2>
              <div className="mt-2 h-0.5 w-10 bg-slate-900" />
              <p className="mt-3 text-sm leading-7 text-slate-700">{data.summary}</p>
            </div>
          )}

          {experience.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-slate-900">Work Experience</h2>
              <div className="mt-2 h-0.5 w-10 bg-slate-900" />
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
                        {exp.location && <p>{exp.location}</p>}
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
              <h2 className="text-lg font-bold text-slate-900">Education</h2>
              <div className="mt-2 h-0.5 w-10 bg-slate-900" />
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
      </div>
    </div>
  );
}
