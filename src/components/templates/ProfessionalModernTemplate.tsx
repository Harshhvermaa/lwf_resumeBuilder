import type { ReactNode } from 'react';
import { ResumeData } from '../../lib/supabase';
import { Mail, Phone, MapPin, Calendar } from 'lucide-react';
import {
  getDescriptionPoints,
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

export default function ProfessionalModernTemplate({ data }: TemplateProps) {
  const visibleSkills = getVisibleSkills(data);
  const visibleExperience = getVisibleExperience(data);
  const visibleEducation = getVisibleEducation(data);
  const visibleProjects = getVisibleProjects(data);
  const visibleCertifications = getVisibleCertifications(data);

  const contactItems = [
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
  ].filter(Boolean) as Array<{ key: string; icon: ReactNode; value: string }>;

  return (
      <div className="bg-white w-full min-h-full">
        <div className="mb-8 border-b border-slate-200 pb-5">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900">{data.name || 'Your Name'}</h1>
          <div className="grid grid-cols-3 gap-x-5 gap-y-2 text-sm leading-6 text-slate-600">
            {contactItems.map((item) => (
              <div key={item.key} className="flex items-start gap-2.5">
                <div className="pt-1 text-slate-500">{item.icon}</div>
                <span className="break-words">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {hasSummary(data) && (
          <div className="resume-section mb-8">
            <h2 className="mb-3 border-b-2 border-blue-600 pb-2 text-xl font-bold text-slate-900">
              Professional Summary
            </h2>
            <p className="text-slate-700 leading-8">{data.summary}</p>
          </div>
        )}

        {visibleSkills.length > 0 && (
          <div className="resume-section mb-8">
            <h2 className="mb-3 border-b-2 border-blue-600 pb-2 text-xl font-bold text-slate-900">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {visibleSkills.map((skill, index) => (
                <span
                  key={index}
                  className="rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium leading-5 text-blue-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {visibleExperience.length > 0 && (
          <div className="resume-section mb-8">
            <h2 className="mb-4 border-b-2 border-blue-600 pb-2 text-xl font-bold text-slate-900">
              Work Experience
            </h2>
            <div className="space-y-6">
              {visibleExperience.map((exp, index) => (
                <div key={index} className="resume-item">
                  <div className="mb-2 grid grid-cols-[minmax(0,1fr)_220px] gap-6">
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold leading-7 text-slate-900">{exp.title}</h3>
                      <p className="text-slate-700 font-medium leading-6">{exp.company}</p>
                    </div>
                    <div className="text-right text-sm text-slate-600">
                      {exp.location && <p className="leading-6">{exp.location}</p>}
                      <p className="flex items-start justify-end gap-1.5 leading-6">
                        <Calendar className="mt-1 h-3.5 w-3.5 flex-shrink-0" />
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </p>
                    </div>
                  </div>
                  {getDescriptionPoints(exp.description).length > 0 && (
                    <ul className="mt-2 space-y-2 text-slate-700">
                      {getDescriptionPoints(exp.description).map((point, pointIndex) => (
                        <li key={pointIndex} className="flex gap-2.5 leading-7">
                          <span className="mt-3 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
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
          <div className="resume-section mb-8">
            <h2 className="mb-4 border-b-2 border-blue-600 pb-2 text-xl font-bold text-slate-900">
              Education
            </h2>
            <div className="space-y-4">
              {visibleEducation.map((edu, index) => (
                <div key={index}>
                  <div className="grid grid-cols-[minmax(0,1fr)_220px] gap-6">
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold leading-7 text-slate-900">{edu.degree}</h3>
                      <p className="text-slate-700 font-medium leading-6">{edu.school}</p>
                    </div>
                    <div className="text-right text-sm text-slate-600">
                      {edu.location && <p className="leading-6">{edu.location}</p>}
                      <p className="leading-6">{edu.graduationDate}</p>
                      {edu.gpa && <p className="leading-6">GPA: {edu.gpa}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {visibleProjects.length > 0 && (
          <div className="resume-section mb-8">
            <h2 className="mb-4 border-b-2 border-blue-600 pb-2 text-xl font-bold text-slate-900">
              Projects
            </h2>
            <div className="space-y-4">
              {visibleProjects.map((project, index) => (
                <div key={index}>
                  <h3 className="text-lg font-bold leading-7 text-slate-900">{project.name}</h3>
                  {project.description && (
                    <p className="mb-2 text-slate-700 leading-7">{project.description}</p>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.filter(t => t).map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {visibleCertifications.length > 0 && (
          <div className="resume-section">
            <h2 className="mb-4 border-b-2 border-blue-600 pb-2 text-xl font-bold text-slate-900">
              Certifications & Courses
            </h2>
            <div className="space-y-3">
              {visibleCertifications.map((certification, index) => (
                <div key={index}>
                  <h3 className="text-lg font-bold leading-7 text-slate-900">{certification.name}</h3>
                  {(certification.issuer || certification.date) && (
                    <p className="text-slate-700 leading-6">
                      {[certification.issuer, certification.date].filter(Boolean).join(' | ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
  );
}
