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

export default function TealBandTemplate({ data }: TemplateProps) {
  const skills = getVisibleSkills(data);
  const experience = getVisibleExperience(data);
  const education = getVisibleEducation(data);
  const projects = getVisibleProjects(data);
  const profileImageSrc = getProfileImageSrc(data.profile_image);

  return (
    <div className="bg-white w-full min-h-full">
      <div className="px-8 pt-8">
        <div className="grid grid-cols-[120px_1fr] gap-6 items-center">
          <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-emerald-200 bg-slate-100">
            <img src={profileImageSrc} alt="Profile" className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">{data.name || 'Your Name'}</h1>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-600 mt-1">
              {data.experience?.[0]?.title || 'Professional'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-emerald-800 text-white px-8 py-4 rounded-[1.4rem] mx-8">
        <div className="flex flex-wrap gap-4 text-sm">
          {data.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{data.email}</span>
            </div>
          )}
          {data.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{data.phone}</span>
            </div>
          )}
          {data.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{data.location}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[1.2fr_0.8fr] gap-8 px-8 py-8">
        <div>
          {hasSummary(data) && (
            <div>
              <h2 className="text-lg font-bold text-slate-900">Profile</h2>
              <div className="mt-2 h-0.5 w-10 bg-emerald-700" />
              <p className="mt-3 text-sm leading-7 text-slate-700">{data.summary}</p>
            </div>
          )}

          {experience.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-slate-900">Work Experience</h2>
              <div className="mt-2 h-0.5 w-10 bg-emerald-700" />
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
                            <span className="mt-2 h-1 w-1 rounded-full bg-emerald-500" />
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
        </div>

        <div className="space-y-8">
          {skills.length > 0 && (
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-700">Skills</h3>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-600">
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {education.length > 0 && (
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-700">Education</h3>
              <div className="mt-4 space-y-4">
                {education.map((edu, index) => (
                  <div key={index}>
                    <p className="text-sm font-semibold text-slate-900">{edu.degree}</p>
                    <p className="text-xs text-slate-600">{edu.school}</p>
                    <p className="text-xs text-slate-500">{edu.graduationDate}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {projects.length > 0 && (
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-700">Interests</h3>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                {projects.map((project, index) => (
                  <span key={index} className="rounded-full border border-emerald-200 px-3 py-1">
                    {project.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
