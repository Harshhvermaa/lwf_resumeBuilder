import { ResumeData } from '../../lib/supabase';
import { getDescriptionPoints, getVisibleEducation, getVisibleExperience, getVisibleProjects, getVisibleSkills, hasSummary } from './templateUtils';

interface TemplateProps {
  data: ResumeData;
}

export default function EuropeStandardTemplate({ data }: TemplateProps) {
  const visibleSkills = getVisibleSkills(data);
  const visibleExperience = getVisibleExperience(data);
  const visibleEducation = getVisibleEducation(data);
  const visibleProjects = getVisibleProjects(data);

  return (
      <div className="bg-white w-full min-h-full">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-slate-900 mb-2 tracking-wide">
            {data.name || 'Your Name'}
          </h1>
          <div className="text-sm text-slate-600 space-y-1">
            {data.email && <div>{data.email}</div>}
            {data.phone && <div>{data.phone}</div>}
            {data.location && <div>{data.location}</div>}
          </div>
        </div>

        <div className="h-px bg-slate-300 mb-8"></div>

        {hasSummary(data) && (
          <div className="resume-section mb-8">
            <h2 className="text-base font-semibold text-slate-900 mb-3 tracking-wide">
              PROFILE
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed text-justify">{data.summary}</p>
          </div>
        )}

        {visibleExperience.length > 0 && (
          <div className="resume-section mb-8">
            <h2 className="text-base font-semibold text-slate-900 mb-3 tracking-wide">
              WORK EXPERIENCE
            </h2>
            <div className="space-y-5">
              {visibleExperience.map((exp, index) => (
                <div key={index} className="resume-item">
                  <div className="mb-1">
                    <h3 className="text-sm font-semibold text-slate-900">{exp.title}</h3>
                    <p className="text-sm text-slate-700">
                      {exp.company}, {exp.location}
                    </p>
                    <p className="text-xs text-slate-600 italic">
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </p>
                  </div>
                  {getDescriptionPoints(exp.description, 4).length > 0 && (
                    <ul className="space-y-1 text-sm text-slate-700 leading-relaxed">
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

        {visibleEducation.length > 0 && (
          <div className="resume-section mb-8">
            <h2 className="text-base font-semibold text-slate-900 mb-3 tracking-wide">
              EDUCATION
            </h2>
            <div className="space-y-3">
              {visibleEducation.map((edu, index) => (
                <div key={index}>
                  <h3 className="text-sm font-semibold text-slate-900">{edu.degree}</h3>
                  <p className="text-sm text-slate-700">
                    {edu.school}, {edu.location}
                  </p>
                  <p className="text-xs text-slate-600 italic">{edu.graduationDate}</p>
                  {edu.gpa && <p className="text-xs text-slate-600">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {visibleSkills.length > 0 && (
          <div className="resume-section mb-8">
            <h2 className="text-base font-semibold text-slate-900 mb-3 tracking-wide">
              SKILLS
            </h2>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-700 leading-relaxed">
              {visibleSkills.map((skill, index) => (
                <li key={index}>• {skill}</li>
              ))}
            </ul>
          </div>
        )}

        {visibleProjects.length > 0 && (
          <div className="resume-section">
            <h2 className="text-base font-semibold text-slate-900 mb-3 tracking-wide">
              PROJECTS
            </h2>
            <div className="space-y-3">
              {visibleProjects.map((project, index) => (
                <div key={index}>
                  <h3 className="text-sm font-semibold text-slate-900">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-slate-700 text-justify">{project.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-slate-300">
          <p className="text-xs text-slate-500 italic text-center">
            I hereby authorize the processing of my personal data in accordance with GDPR regulations.
          </p>
        </div>
      </div>
  );
}
