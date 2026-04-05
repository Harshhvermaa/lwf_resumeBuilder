import { ResumeData } from '../../lib/supabase';
import { Mail, Phone, MapPin } from 'lucide-react';
import { getDescriptionPoints, getVisibleEducation, getVisibleExperience, getVisibleProjects, getVisibleSkills, hasSummary } from './templateUtils';

interface TemplateProps {
  data: ResumeData;
}

export default function DubaiStandardTemplate({ data }: TemplateProps) {
  const visibleSkills = getVisibleSkills(data);
  const visibleExperience = getVisibleExperience(data);
  const visibleEducation = getVisibleEducation(data);
  const visibleProjects = getVisibleProjects(data);

  const headerItems = [
    data.email
      ? {
          key: 'email',
          icon: <Mail className="h-4 w-4 flex-shrink-0" />,
          value: data.email,
        }
      : null,
    data.phone
      ? {
          key: 'phone',
          icon: <Phone className="h-4 w-4 flex-shrink-0" />,
          value: data.phone,
        }
      : null,
    data.location
      ? {
          key: 'location',
          icon: <MapPin className="h-4 w-4 flex-shrink-0" />,
          value: data.location,
        }
      : null,
  ].filter(Boolean) as Array<{ key: string; icon: JSX.Element; value: string }>;

  return (
      <div className="bg-white w-full min-h-full">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-10 py-9 text-white">
          <h1 className="mb-5 text-4xl font-bold tracking-tight">{data.name || 'YOUR NAME'}</h1>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[15px] leading-6">
            {headerItems.map((item) => (
              <div key={item.key} className="flex items-start gap-3">
                <div className="pt-1 text-slate-200">{item.icon}</div>
                <span className="break-words text-slate-100">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-10">
          {hasSummary(data) && (
            <div className="resume-section mb-6">
              <h2 className="mb-3 flex items-center gap-3 text-lg font-bold text-slate-900">
                <div className="h-8 w-1 flex-shrink-0 bg-slate-800" />
                PROFESSIONAL PROFILE
              </h2>
              <p className="pl-5 text-[15px] leading-8 text-slate-700">{data.summary}</p>
            </div>
          )}

          {visibleExperience.length > 0 && (
            <div className="resume-section mb-6">
              <h2 className="mb-4 flex items-center gap-3 text-lg font-bold text-slate-900">
                <div className="h-8 w-1 flex-shrink-0 bg-slate-800" />
                WORK EXPERIENCE
              </h2>
              <div className="space-y-5 pl-5">
                {visibleExperience.map((exp, index) => (
                  <div key={index} className="resume-item">
                    <div className="mb-2 flex items-start justify-between gap-6">
                      <h3 className="text-base font-bold leading-6 text-slate-900">{exp.title}</h3>
                      <span className="flex-shrink-0 text-sm leading-6 text-slate-600">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <p className="mb-2 text-sm font-medium leading-6 text-slate-700">
                      {exp.company} | {exp.location}
                    </p>
                    {getDescriptionPoints(exp.description, 4).length > 0 && (
                      <ul className="space-y-2 text-sm leading-7 text-slate-700">
                        {getDescriptionPoints(exp.description, 4).map((point, pointIndex) => (
                          <li key={pointIndex} className="flex items-start gap-2">
                            <span className="mt-3 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-800" />
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

          {visibleEducation.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-4 flex items-center gap-3 text-lg font-bold text-slate-900">
                <div className="h-8 w-1 flex-shrink-0 bg-slate-800" />
                EDUCATION
              </h2>
              <div className="space-y-4 pl-5">
                {visibleEducation.map((edu, index) => (
                  <div key={index}>
                    <div className="flex items-start justify-between gap-6">
                      <h3 className="text-base font-bold leading-6 text-slate-900">{edu.degree}</h3>
                      <span className="flex-shrink-0 text-sm leading-6 text-slate-600">{edu.graduationDate}</span>
                    </div>
                    <p className="text-sm leading-6 text-slate-700">
                      {edu.school} | {edu.location}
                    </p>
                    {edu.gpa && <p className="text-sm leading-6 text-slate-600">GPA: {edu.gpa}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {visibleSkills.length > 0 && (
            <div className="resume-section mb-6">
              <h2 className="mb-4 flex items-center gap-3 text-lg font-bold text-slate-900">
                <div className="h-8 w-1 flex-shrink-0 bg-slate-800" />
                CORE COMPETENCIES
              </h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 pl-5">
                {visibleSkills.map((skill, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-2.5 h-2 w-2 flex-shrink-0 rounded-full bg-slate-800" />
                    <span className="text-sm leading-7 text-slate-700">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {visibleProjects.length > 0 && (
            <div className="resume-section">
              <h2 className="mb-4 flex items-center gap-3 text-lg font-bold text-slate-900">
                <div className="h-8 w-1 flex-shrink-0 bg-slate-800" />
                KEY PROJECTS
              </h2>
              <div className="space-y-4 pl-5">
                {visibleProjects.map((project, index) => (
                  <div key={index}>
                    <h3 className="text-base font-bold leading-6 text-slate-900">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm leading-7 text-slate-700">{project.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
  );
}
