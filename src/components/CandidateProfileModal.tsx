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
  Check
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
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProf, setNewSkillProf] = useState<'Expert' | 'Advanced' | 'Intermediate' | 'Beginner'>('Advanced');
  const [newSkillYears, setNewSkillYears] = useState(3);
  const [savedToast, setSavedToast] = useState(false);

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

  const addSkill = () => {
    if (!newSkillName.trim()) return;
    const newSkill: Skill = {
      skill_name: newSkillName.trim(),
      proficiency: newSkillProf,
      years_of_experience: Number(newSkillYears),
      category: 'Technical',
      endorsements: 10
    };
    setProfile({
      ...profile,
      skills: [...profile.skills, newSkill]
    });
    setNewSkillName('');
  };

  const removeSkill = (index: number) => {
    const nextSkills = [...profile.skills];
    nextSkills.splice(index, 1);
    setProfile({ ...profile, skills: nextSkills });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                Candidate Master Profile
              </h3>
              <p className="text-xs text-slate-400">
                Single source of truth for resume generation and anti-hallucination validation.
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

        {/* Tab Selector */}
        <div className="flex space-x-1 border-b border-slate-800 px-4 pt-2 bg-slate-950/40 overflow-x-auto text-xs font-medium">
          {[
            { id: 'general', label: '👤 General Info' },
            { id: 'skills', label: '⚡ Verified Skills' },
            { id: 'experience', label: '💼 Experience' },
            { id: 'projects', label: '🚀 Projects' },
            { id: 'education', label: '🎓 Education & Certs' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-t-lg transition border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400 bg-slate-800/80 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          {/* 1. General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Roles (comma separated)</label>
                <input
                  type="text"
                  value={profile.target_roles.join(', ')}
                  onChange={(e) => setProfile({ ...profile, target_roles: e.target.value.split(',').map(s => s.trim()) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Executive Summary</label>
                <textarea
                  rows={3}
                  value={profile.summary}
                  onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* 2. Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <input
                  type="text"
                  placeholder="New skill (e.g. Docker, PyTorch, SQL)"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newSkillYears}
                  onChange={(e) => setNewSkillYears(Number(e.target.value))}
                  className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                  title="Years of experience"
                />
                <button
                  onClick={addSkill}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                {profile.skills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{skill.skill_name}</div>
                      <div className="text-slate-400">{skill.proficiency} • {skill.years_of_experience} yrs</div>
                    </div>
                    <button
                      onClick={() => removeSkill(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Experience Tab */}
          {activeTab === 'experience' && (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {profile.experience.map((exp, idx) => (
                <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-start font-bold text-white text-xs sm:text-sm">
                    <span>{exp.job_title} — {exp.company}</span>
                    <span className="text-xs text-slate-400 font-mono">{exp.start_date} – {exp.end_date || 'Present'}</span>
                  </div>
                  <div className="text-xs text-slate-400">{exp.location}</div>
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-0.5">
                    {exp.responsibilities.map((r, rIdx) => (
                      <li key={rIdx}>{r}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* 4. Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {profile.projects.map((proj, idx) => (
                <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold text-white text-xs sm:text-sm">
                    <span>{proj.name}</span>
                    <span className="text-emerald-400">{proj.metrics}</span>
                  </div>
                  <p className="text-slate-300">{proj.description}</p>
                  <div className="text-slate-400">
                    <strong>Tech Stack: </strong>{proj.skills_used.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 5. Education Tab */}
          {activeTab === 'education' && (
            <div className="space-y-4 max-h-80 overflow-y-auto text-xs">
              <div className="space-y-2">
                <h4 className="font-bold text-white">Education</h4>
                {profile.education.map((edu, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="font-semibold text-white">{edu.degree} in {edu.field_of_study}</div>
                    <div className="text-slate-400">{edu.institution} ({edu.graduation_year}) • GPA: {edu.gpa}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white">Certifications</h4>
                {profile.certifications.map((cert, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="font-semibold text-white">{cert.name}</div>
                    <div className="text-slate-400">{cert.issuer} • {cert.issue_date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              id="btn-save-profile"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition"
            >
              {savedToast ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedToast ? "Saved!" : "Save Profile"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
