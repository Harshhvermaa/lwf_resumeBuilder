import { ResumeData } from '../../lib/supabase';
import { Mail, Phone, MapPin } from 'lucide-react';
import { getDescriptionPoints, getVisibleCertifications, getVisibleEducation, getVisibleExperience, getVisibleProjects, getVisibleSkills, hasSummary } from './templateUtils';

interface TemplateProps {
  data: ResumeData;
}

export default function CanadaStandardTemplate({ data }: TemplateProps) {
  const visibleSkills = getVisibleSkills(data);
  const visibleExperience = getVisibleExperience(data);
  const visibleEducation = getVisibleEducation(data);
  const visibleProjects = getVisibleProjects(data);
  const visibleCertifications = getVisibleCertifications(data);

  return (
      <div className="bg-white w-full min-h-full">
        <div className="border-l-4 border-blue-600 pl-6 mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">{data.name || 'YOUR NAME'}</h1>
          <div className="grid grid-cols-3 gap-3 text-sm text-slate-600">
            {data.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                <span>{data.email}</span>
              </div>
            )}
            {data.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>{data.phone}</span>
              </div>
            )}
            {data.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{data.location}</span>
              </div>
            )}
          </div>
        </div>

        {hasSummary(data) && (
          <div className="resume-section mb-7">
            <h2 className="text-lg font-bold text-blue-600 mb-2 uppercase">
              Professional Summary
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed border-l-2 border-slate-300 pl-4">
              {data.summary}
            </p>
          </div>
        )}

        {visibleExperience.length > 0 && (
          <div className="resume-section mb-7">
            <h2 className="text-lg font-bold text-blue-600 mb-3 uppercase">
              Professional Experience
            </h2>
            <div className="space-y-5 border-l-2 border-slate-300 pl-4">
              {visibleExperience.map((exp, index) => (
                <div key={index} className="resume-item">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-base font-bold text-slate-900">{exp.title}</h3>
                    <span className="text-xs text-slate-600">
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    {exp.company} | {exp.location}
                  </p>
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
          <div className="resume-section mb-7">
            <h2 className="text-lg font-bold text-blue-600 mb-3 uppercase">
              Education
            </h2>
            <div className="space-y-3 border-l-2 border-slate-300 pl-4">
              {visibleEducation.map((edu, index) => (
                <div key={index}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-base font-bold text-slate-900">{edu.degree}</h3>
                    <span className="text-xs text-slate-600">{edu.graduationDate}</span>
                  </div>
                  <p className="text-sm text-slate-700">
                    {edu.school}, {edu.location}
                  </p>
                  {edu.gpa && <p className="text-sm text-slate-600">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {visibleSkills.length > 0 && (
          <div className="resume-section mb-7">
            <h2 className="text-lg font-bold text-blue-600 mb-3 uppercase">
              Technical Skills & Competencies
            </h2>
            <div className="grid grid-cols-3 gap-2 border-l-2 border-slate-300 pl-4">
              {visibleSkills.map((skill, index) => (
                <div key={index} className="text-sm text-slate-700">
                  • {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {visibleProjects.length > 0 && (
          <div className="resume-section">
            <h2 className="text-lg font-bold text-blue-600 mb-3 uppercase">
              Key Projects & Achievements
            </h2>
            <div className="space-y-3 border-l-2 border-slate-300 pl-4">
              {visibleProjects.map((project, index) => (
                <div key={index}>
                  <h3 className="text-base font-bold text-slate-900">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-slate-700 leading-relaxed">{project.description}</p>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <p className="text-xs text-slate-600 mt-1">
                      Technologies: {project.technologies.filter(t => t).join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {visibleCertifications.length > 0 && (
          <div className="mt-7">
            <h2 className="text-lg font-bold text-blue-600 mb-3 uppercase">
              Certifications
            </h2>
            <div className="space-y-2 border-l-2 border-slate-300 pl-4">
              {visibleCertifications.map((cert, index) => (
                <div key={index}>
                  <h3 className="text-sm font-bold text-slate-900">{cert.name}</h3>
                  <p className="text-xs text-slate-600">
                    {cert.issuer} | {cert.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
  );
}
