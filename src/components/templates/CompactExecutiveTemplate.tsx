import { ResumeData } from '../../lib/supabase';
import { getDescriptionPoints, getVisibleCertifications, getVisibleEducation, getVisibleExperience, getVisibleProjects, getVisibleSkills, hasSummary } from './templateUtils';

interface TemplateProps {
  data: ResumeData;
}

export default function CompactExecutiveTemplate({ data }: TemplateProps) {
  const visibleSkills = getVisibleSkills(data);
  const visibleEducation = getVisibleEducation(data);
  const visibleCertifications = getVisibleCertifications(data);
  const visibleExperience = getVisibleExperience(data);
  const visibleProjects = getVisibleProjects(data);

  return (
      <div className="bg-white w-full min-h-full">
        <div className="bg-slate-900 text-white p-6 -m-10 mb-6">
          <h1 className="text-3xl font-bold mb-2">{data.name || 'YOUR NAME'}</h1>
          <div className="text-sm text-slate-300">
            {[data.email, data.phone, data.location].filter(Boolean).join(' | ')}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 space-y-5">
            {visibleSkills.length > 0 && (
              <div>
                <h2 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider bg-slate-200 px-2 py-1">
                  Skills
                </h2>
                <div className="space-y-1">
                  {visibleSkills.map((skill, index) => (
                    <div key={index} className="text-xs text-slate-700 pl-2">• {skill}</div>
                  ))}
                </div>
              </div>
            )}

            {visibleEducation.length > 0 && (
              <div>
                <h2 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider bg-slate-200 px-2 py-1">
                  Education
                </h2>
                {visibleEducation.map((edu, index) => (
                  <div key={index} className="mb-3 pl-2">
                    <p className="text-xs font-bold text-slate-900">{edu.degree}</p>
                    <p className="text-xs text-slate-700">{edu.school}</p>
                    <p className="text-xs text-slate-600">{edu.graduationDate}</p>
                  </div>
                ))}
              </div>
            )}

            {visibleCertifications.length > 0 && (
              <div>
                <h2 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider bg-slate-200 px-2 py-1">
                  Certifications
                </h2>
                {visibleCertifications.map((cert, index) => (
                  <div key={index} className="mb-2 pl-2">
                    <p className="text-xs font-bold text-slate-900">{cert.name}</p>
                    <p className="text-xs text-slate-600">{cert.issuer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-span-2 space-y-5">
            {hasSummary(data) && (
              <div>
                <h2 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider bg-slate-200 px-2 py-1">
                  Executive Summary
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed pl-2">{data.summary}</p>
              </div>
            )}

            {visibleExperience.length > 0 && (
              <div>
                <h2 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider bg-slate-200 px-2 py-1">
                  Professional Experience
                </h2>
                <div className="space-y-4 pl-2">
                  {visibleExperience.map((exp, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-baseline mb-1">
                        <p className="text-sm font-bold text-slate-900">{exp.title}</p>
                        <p className="text-xs text-slate-600">
                          {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                        </p>
                      </div>
                      <p className="text-xs text-slate-700 font-medium mb-1">
                        {exp.company} | {exp.location}
                      </p>
                      {getDescriptionPoints(exp.description, 4).length > 0 && (
                        <ul className="space-y-1 text-xs text-slate-700 leading-relaxed">
                          {getDescriptionPoints(exp.description, 4).map((point, pointIndex) => (
                            <li key={pointIndex}>• {point}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {visibleProjects.length > 0 && (
              <div>
                <h2 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider bg-slate-200 px-2 py-1">
                  Key Projects
                </h2>
                <div className="space-y-2 pl-2">
                  {visibleProjects.map((project, index) => (
                    <div key={index}>
                      <p className="text-xs font-bold text-slate-900">{project.name}</p>
                      {project.description && (
                        <p className="text-xs text-slate-700">{project.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
