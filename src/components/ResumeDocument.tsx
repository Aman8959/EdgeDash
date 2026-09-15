import React from 'react';
import { UserResumeVersion, CandidateProfile } from '../types';
import { ExternalLink, Mail, Phone, MapPin, Globe, Code } from 'lucide-react';

interface ResumeDocumentProps {
  resume: UserResumeVersion | {
    full_name: string;
    email: string;
    phone?: string;
    location: string;
    title?: string;
    summary?: string;
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
    skills?: any[];
    technical_skills?: string[];
    soft_skills?: string[];
    experience?: any[];
    projects?: any[];
    education?: any[];
    certifications?: any[];
    achievements?: string[];
    languages?: string[];
    enabled_sections?: Record<string, boolean>;
  };
  roleName?: string;
  isPrintMode?: boolean;
}

export const ResumeDocument: React.FC<ResumeDocumentProps> = ({
  resume,
  roleName,
  isPrintMode = false
}) => {
  // Extract contact fields cleanly
  const fullName = ('personal_info' in resume) ? resume.personal_info.full_name : resume.full_name;
  const email = ('personal_info' in resume) ? resume.personal_info.email : resume.email;
  const phone = ('personal_info' in resume) ? resume.personal_info.phone : resume.phone;
  const location = ('personal_info' in resume) ? resume.personal_info.location : resume.location;
  const professionalTitle = ('personal_info' in resume)
    ? (resume.personal_info.title || roleName || 'Data & Analytics Specialist')
    : (resume.title || roleName || 'Data & Analytics Specialist');

  const linkedin = ('personal_info' in resume) ? resume.personal_info.linkedin_url : resume.linkedin_url;
  const github = ('personal_info' in resume) ? resume.personal_info.github_url : resume.github_url;
  const portfolio = ('personal_info' in resume) ? resume.personal_info.portfolio_url : resume.portfolio_url;
  const summary = resume.summary || '';

  // Check section visibility toggles if defined
  const isSectionEnabled = (sectionKey: string) => {
    if ('enabled_sections' in resume && resume.enabled_sections) {
      return resume.enabled_sections[sectionKey] !== false;
    }
    return true;
  };

  // Skills
  const skillsList: string[] = [];
  if ('technical_skills' in resume && Array.isArray(resume.technical_skills) && resume.technical_skills.length > 0) {
    skillsList.push(...resume.technical_skills);
  } else if ('skills' in resume && Array.isArray(resume.skills)) {
    skillsList.push(...resume.skills.map((s: any) => typeof s === 'string' ? s : s.skill_name));
  }

  const softSkillsList: string[] = ('soft_skills' in resume && Array.isArray(resume.soft_skills)) 
    ? resume.soft_skills 
    : [];

  const experienceList: any[] = ('experience' in resume && Array.isArray(resume.experience)) 
    ? resume.experience 
    : [];

  const projectsList: any[] = ('projects' in resume && Array.isArray(resume.projects)) 
    ? resume.projects 
    : [];

  const educationList: any[] = ('education' in resume && Array.isArray(resume.education)) 
    ? resume.education 
    : [];

  const certList: any[] = ('certifications' in resume && Array.isArray(resume.certifications)) 
    ? resume.certifications 
    : [];

  const achievementsList: string[] = ('achievements' in resume && Array.isArray(resume.achievements)) 
    ? resume.achievements 
    : [];

  const languagesList: string[] = ('languages' in resume && Array.isArray(resume.languages)) 
    ? resume.languages 
    : [];

  return (
    <div 
      id="resume-document-root"
      className={`bg-white text-slate-900 mx-auto transition-all ${
        isPrintMode 
          ? 'p-0 shadow-none max-w-none' 
          : 'p-6 sm:p-12 shadow-2xl rounded-xl max-w-4xl border border-slate-200 print:border-none print:shadow-none print:p-0'
      }`}
      style={{
        minHeight: isPrintMode ? 'auto' : '297mm',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* 1. Header with Name and Contacts */}
      <header className="border-b-2 border-slate-800 pb-4 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 uppercase">
              {fullName}
            </h1>
            <p className="text-sm sm:text-base font-bold text-blue-600 mt-0.5">
              {professionalTitle}
            </p>
          </div>

          <div className="text-xs text-slate-600 space-y-1 sm:text-right">
            <div className="flex sm:justify-end items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{location}</span>
            </div>
            <div className="flex sm:justify-end items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <a href={`mailto:${email}`} className="hover:text-blue-600 transition">{email}</a>
            </div>
            {phone && (
              <div className="flex sm:justify-end items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Links bar */}
        {(linkedin || github || portfolio) && (
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-medium text-blue-600">
            {linkedin && (
              <a 
                href={linkedin} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-1 hover:underline"
              >
                <Globe className="w-3 h-3" />
                <span>LinkedIn</span>
              </a>
            )}
            {github && (
              <a 
                href={github} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-1 hover:underline"
              >
                <Code className="w-3 h-3" />
                <span>GitHub</span>
              </a>
            )}
            {portfolio && (
              <a 
                href={portfolio} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-1 hover:underline"
              >
                <Globe className="w-3 h-3" />
                <span>Portfolio</span>
              </a>
            )}
          </div>
        )}
      </header>

      {/* 2. Professional Summary */}
      {isSectionEnabled('summary') && summary && (
        <section className="mb-5">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
            Professional Summary
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
            {summary}
          </p>
        </section>
      )}

      {/* 3. Technical & Core Skills */}
      {isSectionEnabled('skills') && skillsList.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
            Technical Skills & Tools
          </h2>
          <div className="text-xs sm:text-sm text-slate-800 leading-relaxed">
            <span className="font-semibold text-slate-900">Technical Expertise: </span>
            {skillsList.join('  •  ')}
          </div>
          {softSkillsList.length > 0 && (
            <div className="text-xs sm:text-sm text-slate-800 mt-1.5 leading-relaxed">
              <span className="font-semibold text-slate-900">Professional Competencies: </span>
              {softSkillsList.join('  •  ')}
            </div>
          )}
        </section>
      )}

      {/* 4. Professional Experience */}
      {isSectionEnabled('experience') && experienceList.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {experienceList.map((exp, idx) => {
              const bullets: string[] = Array.isArray(exp.responsibilities) && exp.responsibilities.length > 0
                ? exp.responsibilities
                : (exp.description ? [exp.description] : []);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      {exp.job_title}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {exp.start_date || '2023'} – {exp.end_date || 'Present'}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    {exp.company}{exp.location ? ` • ${exp.location}` : ''}
                  </div>
                  <ul className="list-disc pl-4 space-y-1 mt-1 text-xs sm:text-sm text-slate-700">
                    {bullets.map((b, bIdx) => (
                      <li key={bIdx} className="leading-relaxed">
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. Key Projects & Systems */}
      {isSectionEnabled('projects') && projectsList.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">
            Key Projects & Systems
          </h2>
          <div className="space-y-3.5">
            {projectsList.slice(0, 4).map((proj, idx) => {
              const techStack = [
                ...(Array.isArray(proj.skills_used) ? proj.skills_used : []),
                ...(Array.isArray(proj.keywords) ? proj.keywords : [])
              ].filter(Boolean);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      {proj.name}
                      {proj.metrics && (
                        <span className="font-normal text-xs text-emerald-700 ml-2">
                          ({proj.metrics})
                        </span>
                      )}
                    </span>
                    {(proj.github_url || proj.url) && (
                      <a
                        href={proj.github_url || proj.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline font-medium inline-flex items-center gap-0.5"
                      >
                        <span>Project Link</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {proj.description}
                  </p>
                  {techStack.length > 0 && (
                    <p className="text-xs text-slate-500 font-mono">
                      <strong>Tech Stack:</strong> {techStack.slice(0, 8).join(', ')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. Education & Certifications Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5">
        {/* Education */}
        {isSectionEnabled('education') && educationList.length > 0 && (
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
              Education
            </h2>
            <div className="space-y-2">
              {educationList.map((edu, idx) => (
                <div key={idx} className="text-xs sm:text-sm">
                  <div className="font-bold text-slate-900">
                    {edu.degree} in {edu.field_of_study}
                  </div>
                  <div className="text-slate-600 text-xs">
                    {edu.institution} ({edu.graduation_year}){edu.gpa ? ` • GPA: ${edu.gpa}` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {isSectionEnabled('certifications') && certList.length > 0 && (
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
              Certifications & Credentials
            </h2>
            <div className="space-y-2">
              {certList.map((cert, idx) => (
                <div key={idx} className="text-xs sm:text-sm">
                  <div className="font-bold text-slate-900">
                    {cert.name}
                  </div>
                  <div className="text-slate-600 text-xs">
                    {cert.issuer} • {cert.issue_date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 7. Achievements & Languages */}
      {(isSectionEnabled('achievements') && achievementsList.length > 0 || isSectionEnabled('languages') && languagesList.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
          {achievementsList.length > 0 && isSectionEnabled('achievements') && (
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
                Honors & Key Achievements
              </h2>
              <ul className="list-disc pl-4 space-y-1 text-xs sm:text-sm text-slate-700">
                {achievementsList.map((ach, idx) => (
                  <li key={idx}>{ach}</li>
                ))}
              </ul>
            </div>
          )}

          {languagesList.length > 0 && isSectionEnabled('languages') && (
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
                Languages
              </h2>
              <p className="text-xs sm:text-sm text-slate-700">
                {languagesList.join('  •  ')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Document ATS Footer watermark */}
      <footer className="mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
        <span>Standard ATS-Optimized Document • Generated by EdgeDash Career Intelligence</span>
      </footer>
    </div>
  );
};
