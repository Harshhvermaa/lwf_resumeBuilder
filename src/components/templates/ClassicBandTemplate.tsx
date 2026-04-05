import { Award, Briefcase, Mail, MapPin, Phone } from 'lucide-react';
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

export default function ClassicBandTemplate({ data }: TemplateProps) {
  const skills = getVisibleSkills(data);
  const experience = getVisibleExperience(data);
  const education = getVisibleEducation(data);
  const certifications = getVisibleCertifications(data);
  const projects = getVisibleProjects(data);
  const profileImageSrc = getProfileImageSrc(data.profile_image);
  const role = data.experience?.[0]?.title || 'Chief Information Officer';

  return (
    <div className="bg-white w-full min-h-full">
      <div className="min-h-[1123px] px-8 pt-8">
        <div className="flex items-start gap-6">
          <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-slate-200 bg-slate-100 shadow-sm">
            <img src={profileImageSrc} alt="Profile" className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">{data.name || 'Your Name'}</h1>
            <p className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{role}</p>
            {hasSummary(data) && (
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">{data.summary}</p>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-[1.5rem] bg-slate-900 px-6 py-3 text-white">
          <div className="flex flex-wrap gap-4 text-xs">
            {data.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-200" />
                <span>{data.email}</span>
              </div>
            )}
            {data.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-200" />
                <span>{data.phone}</span>
              </div>
            )}
            {data.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-200" />
                <span>{data.location}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-[1.2fr_0.8fr] gap-8 py-8">
          <section>
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
                          {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                        </div>
                      </div>
                      {getDescriptionPoints(exp.description, 3).length > 0 && (
                        <ul className="mt-3 space-y-1 text-xs text-slate-600">
                          {getDescriptionPoints(exp.description, 3).map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="mt-2 h-1 w-1 rounded-full bg-slate-700" />
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
                  <Award className="h-4 w-4 text-slate-700" />
                  Education
                </div>
                <div className="mt-4 space-y-4">
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

          <aside className="space-y-6">
            {skills.length > 0 && (
              <div className="rounded-2xl bg-slate-50 p-5">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">General Skills</h3>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  {skills.slice(0, 10).map((skill, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-700" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {certifications.length > 0 && (
              <div className="rounded-2xl bg-slate-50 p-5">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">Certifications</h3>
                <div className="mt-3 space-y-3 text-xs text-slate-600">
                  {certifications.slice(0, 4).map((cert, index) => (
                    <div key={index}>
                      <p className="font-semibold text-slate-800">{cert.name}</p>
                      <p className="text-[11px] text-slate-500">{cert.issuer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {projects.length > 0 && (
              <div className="rounded-2xl bg-slate-50 p-5">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">Interests</h3>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
                  {projects.slice(0, 6).map((project, index) => (
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
