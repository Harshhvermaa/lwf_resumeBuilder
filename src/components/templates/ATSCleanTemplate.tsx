import { ResumeData } from '../../lib/supabase';
import { Mail, Phone, MapPin } from 'lucide-react';
import { getDescriptionPoints, getVisibleCertifications, getVisibleEducation, getVisibleExperience, getVisibleProjects, getVisibleSkills, hasSummary } from './templateUtils';

interface TemplateProps {
  data: ResumeData;
}

export default function ATSCleanTemplate({ data }: TemplateProps) {
  const visibleSkills = getVisibleSkills(data);
  const visibleExperience = getVisibleExperience(data);
  const visibleEducation = getVisibleEducation(data);
  const visibleProjects = getVisibleProjects(data);
  const visibleCertifications = getVisibleCertifications(data);

  return (
      <div className="bg-white w-full min-h-full">
        <div className="text-center mb-8 pb-6 border-b border-slate-300">
          <h1 className="text-3xl font-bold text-slate-900 mb-3 uppercase tracking-wide">
            {data.name || 'YOUR NAME'}
          </h1>
          <div className="flex justify-center gap-4 text-sm text-slate-600">
            {data.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" /> {data.email}
              </span>
            )}
            {data.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" /> {data.phone}
              </span>
            )}
            {data.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {data.location}
              </span>
            )}
          </div>
        </div>

        {hasSummary(data) && (
          <div className="resume-section mb-6">
            <h2 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">
              Professional Summary
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">{data.summary}</p>
          </div>
        )}

        {visibleExperience.length > 0 && (
          <div className="resume-section mb-6">
            <h2 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
              Work Experience
            </h2>
            {visibleExperience.map((exp, index) => (
              <div key={index} className="resume-item mb-4">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-sm font-bold text-slate-900">{exp.title}</h3>
                  <span className="text-xs text-slate-600">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <p className="text-sm text-slate-700 mb-1">{exp.company} | {exp.location}</p>
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
        )}

        {visibleEducation.length > 0 && (
          <div className="resume-section mb-6">
            <h2 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
              Education
            </h2>
            {visibleEducation.map((edu, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-bold text-slate-900">{edu.degree}</h3>
                  <span className="text-xs text-slate-600">{edu.graduationDate}</span>
                </div>
                <p className="text-sm text-slate-700">{edu.school} | {edu.location}</p>
                {edu.gpa && <p className="text-sm text-slate-600">GPA: {edu.gpa}</p>}
              </div>
            ))}
          </div>
        )}

        {visibleSkills.length > 0 && (
          <div className="resume-section mb-6">
            <h2 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">
              Skills
            </h2>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-700">
              {visibleSkills.map((skill, index) => (
                <li key={index}>• {skill}</li>
              ))}
            </ul>
          </div>
        )}

        {visibleProjects.length > 0 && (
          <div className="resume-section mb-6">
            <h2 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
              Projects
            </h2>
            {visibleProjects.map((project, index) => (
              <div key={index} className="mb-3">
                <h3 className="text-sm font-bold text-slate-900">{project.name}</h3>
                {project.description && (
                  <p className="text-sm text-slate-700">{project.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {visibleCertifications.length > 0 && (
          <div className="resume-section">
            <h2 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
              Certifications & Courses
            </h2>
            {visibleCertifications.map((certification, index) => (
              <div key={index} className="mb-3">
                <h3 className="text-sm font-bold text-slate-900">{certification.name}</h3>
                {(certification.issuer || certification.date) && (
                  <p className="text-sm text-slate-700">
                    {[certification.issuer, certification.date].filter(Boolean).join(' • ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
  );
}
