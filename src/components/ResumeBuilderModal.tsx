import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Eye, 
  Download, 
  Check, 
  FileText, 
  Sparkles,
  User, 
  Briefcase, 
  Code, 
  GraduationCap, 
  Award, 
  Globe, 
  CheckCircle2, 
  ToggleLeft, 
  ToggleRight
} from 'lucide-react';
import { CandidateProfile, UserResumeVersion, Experience, Project, Education, Certification } from '../types';
import { ResumeDocument } from './ResumeDocument';
import { exportResumeToPDF } from '../services/pdfService';

interface ResumeBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateProfile;
  onSaveCandidate: (updated: CandidateProfile) => void;
}

export const ResumeBuilderModal: React.FC<ResumeBuilderModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onSaveCandidate
}) => {
  const [activeSection, setActiveSection] = useState<'personal' | 'summary' | 'skills' | 'experience' | 'projects' | 'education' | 'certifications' | 'preview'>('personal');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Local editable draft state
  const [draft, setDraft] = useState<CandidateProfile>(JSON.parse(JSON.stringify(candidate)));
  const [softSkills, setSoftSkills] = useState<string[]>(['Analytical Thinking', 'Problem Solving', 'Data Storytelling', 'Cross-Functional Collaboration']);
  const [enabledSections, setEnabledSections] = useState<Record<string, boolean>>({
    summary: true,
    skills: true,
    experience: true,
    projects: true,
    education: true,
    certifications: true,
    achievements: true,
    languages: true
  });

  if (!isOpen) return null;

  const handleSaveAll = () => {
    onSaveCandidate(draft);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      await exportResumeToPDF(draft, draft.target_roles[0] || 'Data_Analyst');
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  // Section toggle handler
  const toggleSection = (sec: string) => {
    setEnabledSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Experience handlers
  const handleAddExperience = () => {
    const newExp: Experience = {
      company: 'New Organization',
      job_title: 'Data Specialist',
      location: draft.location || 'Remote',
      start_date: '2023',
      end_date: 'Present',
      description: 'Led data modeling and dashboard automation projects.',
      responsibilities: [
        'Built automated SQL data pipelines improving query speed by 25%',
        'Developed executive BI dashboards tracking key product performance metrics'
      ],
      skills_demonstrated: ['SQL', 'Python', 'Power BI'],
      skills_used: ['SQL', 'Python', 'Power BI']
    };
    setDraft({ ...draft, experience: [newExp, ...draft.experience] });
  };

  const handleDeleteExperience = (index: number) => {
    const updated = draft.experience.filter((_, i) => i !== index);
    setDraft({ ...draft, experience: updated });
  };

  // Project handlers
  const handleAddProject = () => {
    const newProj: Project = {
      name: 'New Analytics System',
      description: 'Engineered an end-to-end data analytics workflow processing large datasets with high reliability.',
      category: 'Data Analytics',
      target_roles: ['Data Analyst'],
      priority: 1,
      skills_used: ['Python', 'Pandas', 'SQL'],
      keywords: ['Analytics', 'Optimization'],
      metrics: 'Analyzed 500k+ rows'
    };
    setDraft({ ...draft, projects: [newProj, ...draft.projects] });
  };

  const handleDeleteProject = (index: number) => {
    const updated = draft.projects.filter((_, i) => i !== index);
    setDraft({ ...draft, projects: updated });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Resume Builder & Master Profile</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Single Source of Truth
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                0 Hallucinations: All AI resumes and job applications strictly pull from these verified records.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAll}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Saved!' : 'Save Changes'}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export A4 PDF'}</span>
            </button>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section Navigation Pills */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 sm:px-6 pt-2 pb-2 flex flex-wrap gap-1.5 overflow-x-auto">
          {[
            { id: 'personal', label: '1. Personal Info', icon: User },
            { id: 'summary', label: '2. Summary', icon: FileText },
            { id: 'skills', label: '3. Skills', icon: Code },
            { id: 'experience', label: '4. Experience', icon: Briefcase },
            { id: 'projects', label: '5. Projects', icon: Sparkles },
            { id: 'education', label: '6. Education & Certs', icon: GraduationCap },
            { id: 'preview', label: '👁️ Live A4 Preview', icon: Eye }
          ].map(sec => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shrink-0 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Editor Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">

          {/* 1. PERSONAL INFO */}
          {activeSection === 'personal' && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Personal Information & Online Profiles
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    value={draft.full_name}
                    onChange={(e) => setDraft({ ...draft, full_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs sm:text-sm text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Target Role Title *</label>
                  <input
                    type="text"
                    value={draft.target_roles[0] || 'Data Analyst'}
                    onChange={(e) => setDraft({ ...draft, target_roles: [e.target.value] })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs sm:text-sm text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Email Address *</label>
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs sm:text-sm text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Phone Number</label>
                  <input
                    type="text"
                    value={draft.phone || ''}
                    onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs sm:text-sm text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Location (City, Country)</label>
                  <input
                    type="text"
                    value={draft.location || ''}
                    onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs sm:text-sm text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={draft.linkedin_url || ''}
                    onChange={(e) => setDraft({ ...draft, linkedin_url: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs sm:text-sm text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">GitHub Profile URL</label>
                  <input
                    type="url"
                    value={draft.github_url || ''}
                    onChange={(e) => setDraft({ ...draft, github_url: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs sm:text-sm text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Portfolio / Personal Website</label>
                  <input
                    type="url"
                    value={draft.portfolio_url || ''}
                    onChange={(e) => setDraft({ ...draft, portfolio_url: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs sm:text-sm text-slate-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. PROFESSIONAL SUMMARY */}
          {activeSection === 'summary' && (
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Professional Summary
                </h3>
                <button
                  type="button"
                  onClick={() => toggleSection('summary')}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
                >
                  {enabledSections.summary ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-slate-500" />}
                  <span>{enabledSections.summary ? 'Section Enabled' : 'Section Disabled'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-400">
                A high-impact 2-4 sentence executive overview communicating your core technical competencies and analytical achievements.
              </p>

              <textarea
                rows={5}
                value={draft.summary || ''}
                onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs sm:text-sm text-slate-200 leading-relaxed focus:outline-none focus:border-blue-500"
                placeholder="Results-driven Data Analyst with verified expertise in Python, SQL, and Power BI..."
              />
            </div>
          )}

          {/* 3. TECHNICAL & SOFT SKILLS */}
          {activeSection === 'skills' && (
            <div className="space-y-5 max-w-3xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Technical & Domain Skills
                </h3>
                <span className="text-xs text-slate-400">{draft.skills.length} skills recorded</span>
              </div>

              {/* Add Skill Bar */}
              <div className="flex gap-2">
                <input
                  id="input-new-skill"
                  type="text"
                  placeholder="Type new skill (e.g. Docker, Snowflake, PySpark)..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs sm:text-sm text-slate-200"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = (e.currentTarget.value || '').trim();
                      if (val && !draft.skills.some(s => s.skill_name.toLowerCase() === val.toLowerCase())) {
                        setDraft({
                          ...draft,
                          skills: [...draft.skills, { skill_name: val, category: 'Technical', verified: true, proficiency: 'Advanced', years_of_experience: 1 }]
                        });
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
              </div>

              {/* Skills Tags Grid */}
              <div className="flex flex-wrap gap-2 pt-2">
                {draft.skills.map((s, idx) => (
                  <div 
                    key={idx} 
                    className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs flex items-center gap-2"
                  >
                    <span>{s.skill_name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextSkills = draft.skills.filter((_, i) => i !== idx);
                        setDraft({ ...draft, skills: nextSkills });
                      }}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. WORK EXPERIENCE */}
          {activeSection === 'experience' && (
            <div className="space-y-4 max-w-4xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Work Experience
                </h3>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Role</span>
                </button>
              </div>

              <div className="space-y-4">
                {draft.experience.map((exp, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                        Role #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteExperience(idx)}
                        className="text-slate-500 hover:text-rose-400 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400">Job Title</label>
                        <input
                          type="text"
                          value={exp.job_title}
                          onChange={(e) => {
                            const updated = [...draft.experience];
                            updated[idx].job_title = e.target.value;
                            setDraft({ ...draft, experience: updated });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400">Company Name</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...draft.experience];
                            updated[idx].company = e.target.value;
                            setDraft({ ...draft, experience: updated });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400">Key Accomplishments (One bullet per line)</label>
                      <textarea
                        rows={3}
                        value={Array.isArray(exp.responsibilities) ? exp.responsibilities.join('\n') : exp.description || ''}
                        onChange={(e) => {
                          const lines = e.target.value.split('\n').filter(Boolean);
                          const updated = [...draft.experience];
                          updated[idx].responsibilities = lines;
                          setDraft({ ...draft, experience: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 leading-relaxed font-sans"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. PROJECTS */}
          {activeSection === 'projects' && (
            <div className="space-y-4 max-w-4xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Key Projects & Systems
                </h3>
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              </div>

              <div className="space-y-4">
                {draft.projects.map((proj, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        Project #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(idx)}
                        className="text-slate-500 hover:text-rose-400 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400">Project Name</label>
                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) => {
                            const updated = [...draft.projects];
                            updated[idx].name = e.target.value;
                            setDraft({ ...draft, projects: updated });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400">Measurable Metric (e.g. 99.4% accuracy, 2x faster)</label>
                        <input
                          type="text"
                          value={proj.metrics || ''}
                          onChange={(e) => {
                            const updated = [...draft.projects];
                            updated[idx].metrics = e.target.value;
                            setDraft({ ...draft, projects: updated });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400">Project Description</label>
                      <textarea
                        rows={2}
                        value={proj.description}
                        onChange={(e) => {
                          const updated = [...draft.projects];
                          updated[idx].description = e.target.value;
                          setDraft({ ...draft, projects: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. EDUCATION & CERTS */}
          {activeSection === 'education' && (
            <div className="space-y-5 max-w-3xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Education & Certifications
              </h3>

              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-400">Degree & Institution</span>
                {draft.education.map((edu, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...draft.education];
                          updated[idx].degree = e.target.value;
                          setDraft({ ...draft, education: updated });
                        }}
                        className="bg-slate-900 border border-slate-700 rounded p-2 text-slate-200"
                      />
                      <input
                        type="text"
                        value={edu.field_of_study}
                        onChange={(e) => {
                          const updated = [...draft.education];
                          updated[idx].field_of_study = e.target.value;
                          setDraft({ ...draft, education: updated });
                        }}
                        className="bg-slate-900 border border-slate-700 rounded p-2 text-slate-200"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const updated = [...draft.education];
                          updated[idx].institution = e.target.value;
                          setDraft({ ...draft, education: updated });
                        }}
                        className="bg-slate-900 border border-slate-700 rounded p-2 text-slate-200"
                      />
                      <input
                        type="text"
                        value={edu.graduation_year}
                        onChange={(e) => {
                          const updated = [...draft.education];
                          const parsed = parseInt(e.target.value, 10);
                          updated[idx].graduation_year = isNaN(parsed) ? e.target.value : parsed;
                          setDraft({ ...draft, education: updated });
                        }}
                        className="bg-slate-900 border border-slate-700 rounded p-2 text-slate-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. LIVE A4 PREVIEW (SHARED RESUMEDOCUMENT COMPONENT) */}
          {activeSection === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Exact unified render matching both web preview and downloadable A4 PDF vector output:
                </span>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isExporting}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Document</span>
                </button>
              </div>

              {/* Unified Resume Document Component */}
              <ResumeDocument 
                resume={draft} 
                roleName={draft.target_roles[0]} 
              />
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Close
          </button>
          <button
            onClick={handleSaveAll}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save & Apply Updates</span>
          </button>
        </div>

      </div>
    </div>
  );
};
