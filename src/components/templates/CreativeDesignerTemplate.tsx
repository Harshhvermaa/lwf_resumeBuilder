import { Mail, Phone, Globe } from 'lucide-react';
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

export default function CreativeDesignerTemplate({ data }: TemplateProps) {
  const skills = getVisibleSkills(data);
  const experience = getVisibleExperience(data);
  const education = getVisibleEducation(data);
  const hobbies = getVisibleProjects(data);
  const role = data.experience?.[0]?.title || 'Graphic Designer';
  const profileImageSrc = getProfileImageSrc(data.profile_image);

  return (
    <div className="bg-white w-full min-h-full">
      <div className="grid grid-cols-[260px_1fr] min-h-[1123px]">
        <aside className="bg-[#3a0b0b] text-white px-6 py-8">
          <div className="flex flex-col items-center">
            <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white/80 bg-[#5b1a1a]">
              <img src={profileImageSrc} alt="Profile" className="h-full w-full object-cover" />
            </div>
            <div className="mt-5 text-center">
              <h1 className="text-2xl font-black uppercase tracking-wide">{data.name || 'Your Name'}</h1>
              <p className="text-xs uppercase tracking-[0.18em] text-amber-300">{role}</p>
            </div>
          </div>

          <div className="mt-8 space-y-5 text-sm">
            {data.phone && (
              <div className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2">
                <Phone className="h-4 w-4 text-amber-300" />
                <span>{data.phone}</span>
              </div>
            )}
            {data.email && (
              <div className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2">
                <Mail className="h-4 w-4 text-amber-300" />
                <span>{data.email}</span>
              </div>
            )}
            {data.location && (
              <div className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2">
                <Globe className="h-4 w-4 text-amber-300" />
                <span>{data.location}</span>
              </div>
            )}
          </div>

          {skills.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">Skills</h3>
              <div className="mt-4 space-y-3">
                {skills.map((skill, index) => {
                  const width = Math.max(40, 85 - index * 7);
                  return (
                    <div key={index}>
                      <p className="text-xs text-white/90">{skill}</p>
                      <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                        <div className="h-2 rounded-full bg-amber-400" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {hobbies.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">Hobbies</h3>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/80">
                {hobbies.map((project, index) => (
                  <span key={index} className="rounded-full border border-amber-300/40 px-3 py-1">
                    {project.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>

        <section className="bg-white px-8 py-10">
          {hasSummary(data) && (
            <div>
              <div className="inline-flex items-center gap-3 rounded-full bg-[#3a0b0b] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white">
                About Me
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-700">{data.summary}</p>
            </div>
          )}

          {experience.length > 0 && (
            <div className="mt-8">
              <div className="inline-flex items-center gap-3 rounded-full bg-[#3a0b0b] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white">
                Experience
              </div>
              <div className="mt-5 space-y-6">
                {experience.map((exp, index) => (
                  <div key={index} className="resume-item">
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <p className="text-sm font-bold text-amber-700">{exp.title}</p>
                        <p className="text-xs font-semibold text-slate-600">{exp.company}</p>
                      </div>
                      <div className="text-xs text-slate-500">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </div>
                    </div>
                    {getDescriptionPoints(exp.description, 3).length > 0 && (
                      <ul className="mt-3 space-y-2 text-xs text-slate-600">
                        {getDescriptionPoints(exp.description, 3).map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500" />
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
              <div className="inline-flex items-center gap-3 rounded-full bg-[#3a0b0b] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white">
                Education
              </div>
              <div className="mt-5 space-y-4">
                {education.map((edu, index) => (
                  <div key={index} className="flex items-start justify-between gap-6">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{edu.degree}</p>
                      <p className="text-xs text-slate-600">{edu.school}</p>
                    </div>
                    <div className="text-xs text-slate-500">{edu.graduationDate}</div>
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
