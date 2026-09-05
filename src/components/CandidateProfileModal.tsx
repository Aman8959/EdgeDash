import React, { useState } from 'react';
import { 
  X, 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  FolderGit2, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Globe,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { CandidateProfile, Skill, Experience, Education, Certification, Project } from '../types';
import { defaultCandidateProfile } from '../data/defaultData';

interface CandidateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateProfile;
  onSave: (updated: CandidateProfile) => void;
}

export const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onSave
}) => {
  const [profile, setProfile] = useState<CandidateProfile>(JSON.parse(JSON.stringify(candidate)));
  const [activeTab, setActiveTab] = useState<'general' | 'skills' | 'experience' | 'projects' | 'education'>('general');
  
  // Skills add state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProf, setNewSkillProf] = useState<'Expert' | 'Advanced' | 'Intermediate' | 'Beginner'>('Advanced');
  const [newSkillYears, setNewSkillYears] = useState(3);
  const [newSkillCategory, setNewSkillCategory] = useState('Technical');

  // New Achievement state
  const [newAchievement, setNewAchievement] = useState('');

  const [savedToast, setSavedToast] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setProfile(JSON.parse(JSON.stringify(candidate)));
    }
  }, [isOpen, candidate]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(profile);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 600);
  };

  const handleReset = () => {
    setProfile(JSON.parse(JSON.stringify(defaultCandidateProfile)));
  };

  // --- Skill Handlers ---
  const addSkill = () => {
    if (!newSkillName.trim()) return;
    const newSkill: Skill = {
      skill_name: newSkillName.trim(),
      proficiency: newSkillProf,
      years_of_experience: Number(newSkillYears),
      category: newSkillCategory.trim() || 'Technical',
      endorsements: 10
    };
    setProfile({
      ...profile,
      skills: [...profile.skills, newSkill]
    });
    setNewSkillName('');
  };

  const updateSkill = (index: number, updates: Partial<Skill>) => {
    const nextSkills = [...profile.skills];
    nextSkills[index] = { ...nextSkills[index], ...updates };
    setProfile({ ...profile, skills: nextSkills });
  };

  const removeSkill = (index: number) => {
    const nextSkills = [...profile.skills];
    nextSkills.splice(index, 1);
    setProfile({ ...profile, skills: nextSkills });
  };

  // --- Experience Handlers ---
  const addExperience = () => {
    const newExp: Experience = {
      company: 'New Company',
      job_title: 'Software Engineer',
      location: 'Remote',
      start_date: new Date().toISOString().slice(0, 7),
      end_date: null,
      description: 'Role overview and core technical contributions.',
      responsibilities: [
        'Developed key features enhancing system performance by 25%',
        'Collaborated with cross-functional teams to deploy scalable solutions'
      ],
      skills_demonstrated: ['Python', 'SQL', 'Git']
    };
    setProfile({
      ...profile,
      experience: [newExp, ...profile.experience]
    });
  };

  const updateExperience = (index: number, updates: Partial<Experience>) => {
    const next = [...profile.experience];
    next[index] = { ...next[index], ...updates };
    setProfile({ ...profile, experience: next });
  };

  const removeExperience = (index: number) => {
    const next = [...profile.experience];
    next.splice(index, 1);
    setProfile({ ...profile, experience: next });
  };

  const addExpResponsibility = (expIndex: number) => {
    const next = [...profile.experience];
    next[expIndex].responsibilities.push('New quantifiable achievement or key responsibility');
    setProfile({ ...profile, experience: next });
  };

  const updateExpResponsibility = (expIndex: number, respIndex: number, text: string) => {
    const next = [...profile.experience];
    next[expIndex].responsibilities[respIndex] = text;
    setProfile({ ...profile, experience: next });
  };

  const removeExpResponsibility = (expIndex: number, respIndex: number) => {
    const next = [...profile.experience];
    next[expIndex].responsibilities.splice(respIndex, 1);
    setProfile({ ...profile, experience: next });
  };

  // --- Project Handlers ---
  const addProject = () => {
    const newProj: Project = {
      name: 'New Project',
      category: 'Data / Machine Learning',
      priority: 1,
      target_roles: profile.target_roles.slice(0, 2),
      metrics: 'Improved efficiency by 30%',
      description: 'End-to-end implementation solving key user problems with modern tech stack.',
      skills_used: ['Python', 'React', 'FastAPI'],
      keywords: ['API', 'Database'],
      github_url: 'https://github.com/',
      url: 'https://demo.com'
    };
    setProfile({
      ...profile,
      projects: [newProj, ...profile.projects]
    });
  };

  const updateProject = (index: number, updates: Partial<Project>) => {
    const next = [...profile.projects];
    next[index] = { ...next[index], ...updates };
    setProfile({ ...profile, projects: next });
  };

  const removeProject = (index: number) => {
    const next = [...profile.projects];
    next.splice(index, 1);
    setProfile({ ...profile, projects: next });
  };

  // --- Education & Cert Handlers ---
  const addEducation = () => {
    const newEdu: Education = {
      institution: 'University / Institute',
      degree: 'Bachelor of Technology',
      field_of_study: 'Computer Science',
      graduation_year: new Date().getFullYear(),
      gpa: '3.8 / 4.0'
    };
    setProfile({
      ...profile,
      education: [...profile.education, newEdu]
    });
  };

  const updateEducation = (index: number, updates: Partial<Education>) => {
    const next = [...profile.education];
    next[index] = { ...next[index], ...updates };
    setProfile({ ...profile, education: next });
  };

  const removeEducation = (index: number) => {
    const next = [...profile.education];
    next.splice(index, 1);
    setProfile({ ...profile, education: next });
  };

  const addCertification = () => {
    const newCert: Certification = {
      name: 'New Professional Certification',
      issuer: 'AWS / Coursera / Google',
      issue_date: new Date().toISOString().slice(0, 7),
      expiry_date: null,
      credential_url: 'https://verify.cert'
    };
    setProfile({
      ...profile,
      certifications: [...profile.certifications, newCert]
    });
  };

  const updateCertification = (index: number, updates: Partial<Certification>) => {
    const next = [...profile.certifications];
    next[index] = { ...next[index], ...updates };
    setProfile({ ...profile, certifications: next });
  };

  const removeCertification = (index: number) => {
    const next = [...profile.certifications];
    next.splice(index, 1);
    setProfile({ ...profile, certifications: next });
  };

  // --- Achievement Handlers ---
  const addAchievement = () => {
    if (!newAchievement.trim()) return;
    setProfile({
      ...profile,
      achievements: [...(profile.achievements || []), newAchievement.trim()]
    });
    setNewAchievement('');
  };

  const removeAchievement = (index: number) => {
    const next = [...(profile.achievements || [])];
    next.splice(index, 1);
    setProfile({ ...profile, achievements: next });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh] max-h-[860px]">
        {/* Modal Header */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                Candidate Master Profile
              </h3>
              <p className="text-xs text-slate-400">
                Single source of truth for resume tailoring and zero-hallucination verification.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector - Fixed height with shrink-0 so it NEVER gets squished or covered */}
        <div className="shrink-0 bg-slate-950/95 border-b border-slate-800 px-4 py-2.5 flex items-center gap-2 overflow-x-auto z-10">
          {[
            { id: 'general', label: 'User Details', icon: User, count: null },
            { id: 'experience', label: 'Experience', icon: Briefcase, count: profile.experience.length },
            { id: 'projects', label: 'Projects', icon: FolderGit2, count: profile.projects.length },
            { id: 'education', label: 'Education & Certs', icon: GraduationCap, count: profile.education.length + profile.certifications.length },
            { id: 'skills', label: 'Verified Skills', icon: Sparkles, count: profile.skills.length }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap border ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                    isActive ? 'bg-emerald-500/25 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Body with min-h-0 and overflow-y-auto */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs sm:text-sm">
          {/* ============================================================ */}
          {/* 1. GENERAL TAB (USER DETAILS)                                */}
          {/* ============================================================ */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="e.g. Aman Yadav"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="e.g. aman@example.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location / City</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="e.g. Indore, MP or Remote"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Roles (comma-separated)
                </label>
                <input
                  type="text"
                  value={profile.target_roles.join(', ')}
                  onChange={(e) => setProfile({ 
                    ...profile, 
                    target_roles: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                  })}
                  placeholder="e.g. Data Scientist, Machine Learning Engineer, Python Developer"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Professional Executive Summary
                </label>
                <textarea
                  rows={3}
                  value={profile.summary}
                  onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                  placeholder="Summarize your experience, strengths, and domain background..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              {/* Online Social & Portfolio Links */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Online Profiles & Links</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">LinkedIn URL</label>
                    <input
                      type="url"
                      value={profile.linkedin_url || ''}
                      onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">GitHub URL</label>
                    <input
                      type="url"
                      value={profile.github_url || ''}
                      onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Portfolio / Website</label>
                    <input
                      type="url"
                      value={profile.portfolio_url || ''}
                      onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
                      placeholder="https://myportfolio.com"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Key Achievements */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Key Career Highlights & Achievements
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAchievement(); } }}
                    placeholder="e.g. Published research paper in IEEE, or Won Hackathon 2024"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={addAchievement}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="space-y-1.5 mt-2">
                  {(profile.achievements || []).map((ach, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
                      <span>• {ach}</span>
                      <button
                        onClick={() => removeAchievement(idx)}
                        className="text-slate-500 hover:text-rose-400 transition ml-2"
                        title="Delete achievement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 2. EXPERIENCE TAB (EDITABLE WORK HISTORY)                    */}
          {/* ============================================================ */}
          {activeTab === 'experience' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Work Experience ({profile.experience.length})</h4>
                  <p className="text-xs text-slate-400">Add, edit, or remove past job roles and verified achievements.</p>
                </div>
                <button
                  type="button"
                  onClick={addExperience}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Experience</span>
                </button>
              </div>

              <div className="space-y-4">
                {profile.experience.map((exp, expIdx) => (
                  <div key={expIdx} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        Experience #{expIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeExperience(expIdx)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition flex items-center gap-1 text-xs"
                        title="Delete this experience"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Role</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Job Title</label>
                        <input
                          type="text"
                          value={exp.job_title}
                          onChange={(e) => updateExperience(expIdx, { job_title: e.target.value })}
                          placeholder="e.g. Senior Data Scientist"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(expIdx, { company: e.target.value })}
                          placeholder="e.g. TechCorp Inc."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Location</label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => updateExperience(expIdx, { location: e.target.value })}
                          placeholder="e.g. San Francisco, CA or Remote"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Start Date</label>
                          <input
                            type="text"
                            value={exp.start_date}
                            onChange={(e) => updateExperience(expIdx, { start_date: e.target.value })}
                            placeholder="YYYY-MM"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">End Date</label>
                          <input
                            type="text"
                            value={exp.end_date || ''}
                            onChange={(e) => updateExperience(expIdx, { end_date: e.target.value || null })}
                            placeholder="YYYY-MM or leave blank for Present"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Role Description / Scope</label>
                      <input
                        type="text"
                        value={exp.description}
                        onChange={(e) => updateExperience(expIdx, { description: e.target.value })}
                        placeholder="Brief summary of duties..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Key Responsibilities / Bullets */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-slate-300">
                          Bullet Points & Achievements ({exp.responsibilities.length})
                        </label>
                        <button
                          type="button"
                          onClick={() => addExpResponsibility(expIdx)}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Bullet Point
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {exp.responsibilities.map((resp, rIdx) => (
                          <div key={rIdx} className="flex items-center gap-2">
                            <span className="text-slate-500 text-xs">•</span>
                            <input
                              type="text"
                              value={resp}
                              onChange={(e) => updateExpResponsibility(expIdx, rIdx, e.target.value)}
                              placeholder="Action verb + task + measurable result (e.g. Deployed ML model reducing churn by 20%)"
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeExpResponsibility(expIdx, rIdx)}
                              className="text-slate-500 hover:text-rose-400 p-1.5 transition"
                              title="Delete bullet"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skills demonstrated */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Skills Demonstrated (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={exp.skills_demonstrated.join(', ')}
                        onChange={(e) => updateExperience(expIdx, {
                          skills_demonstrated: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        })}
                        placeholder="e.g. Python, Machine Learning, SQL, AWS, Docker"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 3. PROJECTS TAB (EDITABLE PROJECTS)                          */}
          {/* ============================================================ */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Projects Portfolio ({profile.projects.length})</h4>
                  <p className="text-xs text-slate-400">Add, edit, or customize projects used for ATS keyword & skill matching.</p>
                </div>
                <button
                  type="button"
                  onClick={addProject}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              </div>

              <div className="space-y-4">
                {profile.projects.map((proj, projIdx) => (
                  <div key={projIdx} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                        Project #{projIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeProject(projIdx)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition flex items-center gap-1 text-xs"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Project</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Project Name</label>
                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) => updateProject(projIdx, { name: e.target.value })}
                          placeholder="e.g. Predictive Customer Churn Pipeline"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Category / Domain</label>
                        <input
                          type="text"
                          value={proj.category}
                          onChange={(e) => updateProject(projIdx, { category: e.target.value })}
                          placeholder="e.g. Machine Learning, Data Analytics, Full Stack"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Quantifiable Impact / Key Metrics
                      </label>
                      <input
                        type="text"
                        value={proj.metrics || ''}
                        onChange={(e) => updateProject(projIdx, { metrics: e.target.value })}
                        placeholder="e.g. 88% ROC-AUC, processed 10M rows, saved 15 hrs weekly"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-emerald-400 font-medium focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Project Description</label>
                      <textarea
                        rows={2}
                        value={proj.description}
                        onChange={(e) => updateProject(projIdx, { description: e.target.value })}
                        placeholder="Describe the architecture, problem, and your core technical contribution..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Skills & Tech Stack (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={proj.skills_used.join(', ')}
                          onChange={(e) => updateProject(projIdx, {
                            skills_used: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          })}
                          placeholder="e.g. Python, Scikit-learn, Docker, Streamlit"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">GitHub / Code URL</label>
                        <input
                          type="url"
                          value={proj.github_url || ''}
                          onChange={(e) => updateProject(projIdx, { github_url: e.target.value })}
                          placeholder="https://github.com/username/repo"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 4. EDUCATION & CERTS TAB (EDITABLE ACADEMICS)                */}
          {/* ============================================================ */}
          {activeTab === 'education' && (
            <div className="space-y-6">
              {/* Education Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-blue-400" />
                    <span>Education ({profile.education.length})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1 border border-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-400" />
                    <span>Add Degree</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {profile.education.map((edu, eduIdx) => (
                    <div key={eduIdx} className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400">Education #{eduIdx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeEducation(eduIdx)}
                          className="text-slate-500 hover:text-rose-400 transition"
                          title="Delete education"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-0.5">Degree</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducation(eduIdx, { degree: e.target.value })}
                            placeholder="e.g. Bachelor of Technology / B.Sc."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-0.5">Field of Study / Major</label>
                          <input
                            type="text"
                            value={edu.field_of_study}
                            onChange={(e) => updateEducation(eduIdx, { field_of_study: e.target.value })}
                            placeholder="e.g. Computer Science, Statistics"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-0.5">Institution / University</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => updateEducation(eduIdx, { institution: e.target.value })}
                            placeholder="e.g. IIT Indore / Stanford"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-0.5">Graduation Year</label>
                            <input
                              type="number"
                              value={edu.graduation_year}
                              onChange={(e) => updateEducation(eduIdx, { graduation_year: Number(e.target.value) })}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-0.5">GPA / Grade</label>
                            <input
                              type="text"
                              value={edu.gpa || ''}
                              onChange={(e) => updateEducation(eduIdx, { gpa: e.target.value })}
                              placeholder="e.g. 3.8 / 4.0 or 8.5 CGPA"
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications Section */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Certifications ({profile.certifications.length})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={addCertification}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1 border border-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Add Certification</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {profile.certifications.map((cert, certIdx) => (
                    <div key={certIdx} className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400">Certification #{certIdx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeCertification(certIdx)}
                          className="text-slate-500 hover:text-rose-400 transition"
                          title="Delete certification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-0.5">Certification Name</label>
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => updateCertification(certIdx, { name: e.target.value })}
                            placeholder="e.g. AWS Certified Solutions Architect"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-0.5">Issuer</label>
                          <input
                            type="text"
                            value={cert.issuer}
                            onChange={(e) => updateCertification(certIdx, { issuer: e.target.value })}
                            placeholder="e.g. Amazon Web Services / Google Cloud"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-0.5">Issue Date</label>
                          <input
                            type="text"
                            value={cert.issue_date}
                            onChange={(e) => updateCertification(certIdx, { issue_date: e.target.value })}
                            placeholder="YYYY-MM"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-0.5">Credential URL</label>
                          <input
                            type="url"
                            value={cert.credential_url || ''}
                            onChange={(e) => updateCertification(certIdx, { credential_url: e.target.value })}
                            placeholder="https://..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 5. SKILLS TAB (VERIFIED SKILLS)                              */}
          {/* ============================================================ */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              {/* Add Skill Box */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                <div className="text-xs font-semibold text-slate-300">Add New Verified Skill</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Skill name (e.g. PyTorch, SQL)"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                    className="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <select
                    value={newSkillProf}
                    onChange={(e) => setNewSkillProf(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <option value="Expert">Expert</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Beginner">Beginner</option>
                  </select>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      min="1"
                      max="25"
                      value={newSkillYears}
                      onChange={(e) => setNewSkillYears(Number(e.target.value))}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-center"
                      title="Years of experience"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1 transition shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Skills List with Inline Editing */}
              <div className="space-y-1">
                <div className="text-xs font-bold text-white flex justify-between items-center pb-1">
                  <span>Current Verified Skills ({profile.skills.length})</span>
                  <span className="text-[11px] text-slate-400 font-normal">Edit proficiency or years inline</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                  {profile.skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-white truncate">{skill.skill_name}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <select
                            value={skill.proficiency}
                            onChange={(e) => updateSkill(idx, { proficiency: e.target.value as any })}
                            className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] text-slate-300"
                          >
                            <option value="Expert">Expert</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Beginner">Beginner</option>
                          </select>
                          <input
                            type="number"
                            min="1"
                            max="30"
                            value={skill.years_of_experience}
                            onChange={(e) => updateSkill(idx, { years_of_experience: Number(e.target.value) })}
                            className="w-12 bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-[11px] text-slate-300 text-center"
                            title="Years"
                          />
                          <span className="text-slate-500 text-[10px]">yrs</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSkill(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 transition shrink-0"
                        title="Delete skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="shrink-0 p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              id="btn-save-profile"
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition"
            >
              {savedToast ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedToast ? "Saved Successfully!" : "Save Profile"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
