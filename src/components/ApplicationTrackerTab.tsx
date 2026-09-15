import React, { useState } from 'react';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Mail, 
  AlertCircle, 
  Plus, 
  Trash2, 
  ExternalLink, 
  ChevronRight, 
  ChevronLeft,
  Filter,
  BarChart3,
  Copy,
  Check,
  Building2,
  FileText
} from 'lucide-react';
import { TrackedApplication, ApplicationKanbanStatus, CandidateProfile } from '../types';

interface ApplicationTrackerTabProps {
  applications: TrackedApplication[];
  onUpdateApplication: (app: TrackedApplication) => void;
  onDeleteApplication: (id: string) => void;
  onAddApplication: (app: Omit<TrackedApplication, 'id'>) => void;
  candidate: CandidateProfile;
}

const COLUMNS: { id: ApplicationKanbanStatus; title: string; color: string; bg: string; border: string }[] = [
  { id: 'saved', title: 'Saved / Review', color: 'text-slate-300', bg: 'bg-slate-800/40', border: 'border-slate-700/60' },
  { id: 'applied', title: 'Applied', color: 'text-blue-400', bg: 'bg-blue-950/20', border: 'border-blue-800/50' },
  { id: 'assessment', title: 'Assessment', color: 'text-purple-400', bg: 'bg-purple-950/20', border: 'border-purple-800/50' },
  { id: 'interview', title: 'Interviewing', color: 'text-amber-400', bg: 'bg-amber-950/20', border: 'border-amber-800/50' },
  { id: 'offer', title: 'Offer Received', color: 'text-emerald-400', bg: 'bg-emerald-950/20', border: 'border-emerald-800/50' },
  { id: 'rejected', title: 'Archived / Rejected', color: 'text-rose-400', bg: 'bg-rose-950/20', border: 'border-rose-800/50' }
];

export const ApplicationTrackerTab: React.FC<ApplicationTrackerTabProps> = ({
  applications,
  onUpdateApplication,
  onDeleteApplication,
  onAddApplication,
  candidate
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedAppForFollowup, setSelectedAppForFollowup] = useState<TrackedApplication | null>(null);
  const [copiedFollowup, setCopiedFollowup] = useState<boolean>(false);

  // Form state for adding custom application
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newLocation, setNewLocation] = useState(candidate.location || '');
  const [newSalary, setNewSalary] = useState('');
  const [newStatus, setNewStatus] = useState<ApplicationKanbanStatus>('applied');
  const [newNotes, setNewNotes] = useState('');

  // Follow-up due calculation (today or earlier)
  const todayStr = new Date().toISOString().split('T')[0];
  const isFollowupDue = (app: TrackedApplication) => {
    if (!app.follow_up_date) return false;
    return app.status === 'applied' && app.follow_up_date <= todayStr;
  };

  // Analytics Metrics
  const totalApps = applications.length;
  const appliedCount = applications.filter(a => a.status === 'applied').length;
  const interviewCount = applications.filter(a => a.status === 'interview').length;
  const offerCount = applications.filter(a => a.status === 'offer').length;
  const assessmentCount = applications.filter(a => a.status === 'assessment').length;

  const interviewRate = totalApps > 0 ? Math.round((interviewCount / totalApps) * 100) : 0;
  const offerRate = interviewCount > 0 ? Math.round((offerCount / interviewCount) * 100) : 0;
  const avgFitScore = totalApps > 0 
    ? Math.round(applications.reduce((acc, a) => acc + (a.fit_score || 80), 0) / totalApps)
    : 85;

  const handleStatusChange = (app: TrackedApplication, newStatus: ApplicationKanbanStatus) => {
    onUpdateApplication({ ...app, status: newStatus });
  };

  const handleSaveNewApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newRole) return;

    // Default follow-up date 5 days after applied
    const followDate = new Date();
    followDate.setDate(followDate.getDate() + 5);

    onAddApplication({
      job_id: `custom-${Date.now()}`,
      company: newCompany,
      job_title: newRole,
      job_url: newUrl,
      location: newLocation,
      salary: newSalary,
      status: newStatus,
      applied_date: todayStr,
      resume_version_used: `${candidate.target_roles[0] || 'Data Analyst'} Resume (v1.0)`,
      follow_up_date: followDate.toISOString().split('T')[0],
      notes: newNotes,
      fit_score: 88
    });

    setIsAddModalOpen(false);
    setNewCompany('');
    setNewRole('');
    setNewUrl('');
    setNewSalary('');
    setNewNotes('');
  };

  const generateFollowupEmail = (app: TrackedApplication) => {
    return `Subject: Following up on Application for ${app.job_title} - ${candidate.full_name}

Hi ${app.recruiter_name || `${app.company} Hiring Team`},

I hope you are having a wonderful week.

I am writing to follow up on my recent application for the ${app.job_title} role at ${app.company}, submitted on ${app.applied_date}.

Given my verified experience in ${candidate.skills.slice(0, 4).map(s => s.skill_name).join(', ')} and my passion for data-driven problem solving, I remain extremely excited about the opportunity to contribute to ${app.company}.

Please let me know if you require any additional work samples, code repositories, or reference materials. I look forward to hearing from you.

Best regards,

${candidate.full_name}
${candidate.email} | ${candidate.phone || ''}
${candidate.linkedin_url || ''}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Metrics Bar */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📌 Application Tracker & Kanban Pipeline</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              End-to-end status tracking from initial submission to interview stages and final job offers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1.5 shadow-md shadow-blue-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Track New Application</span>
            </button>
          </div>
        </div>

        {/* Analytics KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Total Tracked</div>
            <div className="text-xl font-extrabold text-white mt-1">{totalApps}</div>
            <div className="text-[10px] text-slate-500">Applications</div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Active Applied</div>
            <div className="text-xl font-extrabold text-blue-400 mt-1">{appliedCount}</div>
            <div className="text-[10px] text-slate-500">Awaiting response</div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Interviews</div>
            <div className="text-xl font-extrabold text-amber-400 mt-1">{interviewCount}</div>
            <div className="text-[10px] text-slate-500">{interviewRate}% conv. rate</div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Offers</div>
            <div className="text-xl font-extrabold text-emerald-400 mt-1">{offerCount}</div>
            <div className="text-[10px] text-slate-500">{offerRate}% offer rate</div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Avg. Fit Score</div>
            <div className="text-xl font-extrabold text-purple-400 mt-1">{avgFitScore}%</div>
            <div className="text-[10px] text-slate-500">Target alignment</div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Follow-ups Due</div>
            <div className="text-xl font-extrabold text-rose-400 mt-1">
              {applications.filter(isFollowupDue).length}
            </div>
            <div className="text-[10px] text-slate-500">Action needed</div>
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(col => {
          const colApps = applications.filter(a => a.status === col.id);

          return (
            <div 
              key={col.id} 
              className={`rounded-xl border ${col.border} ${col.bg} p-3 flex flex-col min-h-[500px] shadow-sm`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                  {col.title}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                  {colApps.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colApps.map(app => {
                  const followupActive = isFollowupDue(app);

                  return (
                    <div 
                      key={app.id} 
                      className="bg-slate-900/95 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 space-y-2.5 shadow-md transition"
                    >
                      {/* Company & Role */}
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-bold text-xs sm:text-sm text-white line-clamp-1">
                            {app.job_title}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 shrink-0">
                            {app.fit_score}%
                          </span>
                        </div>
                        <div className="text-xs font-medium text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          <span>{app.company}</span>
                        </div>
                      </div>

                      {/* Location & Applied Date */}
                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span>{app.location || 'Remote'}</span>
                        <span>Applied: {app.applied_date}</span>
                      </div>

                      {/* Follow-up Indicator */}
                      {followupActive && (
                        <div className="bg-rose-950/50 border border-rose-800/60 rounded-lg p-2 flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 text-[11px] text-rose-300 font-medium">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                            <span>Follow-up Due!</span>
                          </div>
                          <button
                            onClick={() => setSelectedAppForFollowup(app)}
                            className="text-[10px] px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold transition"
                          >
                            Email
                          </button>
                        </div>
                      )}

                      {/* Quick Status Changers */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app, e.target.value as ApplicationKanbanStatus)}
                          className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-blue-500"
                        >
                          <option value="saved">Saved</option>
                          <option value="applied">Applied</option>
                          <option value="assessment">Assessment</option>
                          <option value="interview">Interview</option>
                          <option value="offer">Offer</option>
                          <option value="rejected">Rejected</option>
                        </select>

                        <div className="flex items-center gap-1">
                          {app.job_url && (
                            <a
                              href={app.job_url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-slate-400 hover:text-blue-400 transition"
                              title="Open original listing"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => onDeleteApplication(app.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition"
                            title="Remove from tracker"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colApps.length === 0 && (
                  <div className="h-32 flex flex-col items-center justify-center text-slate-600 text-xs border border-dashed border-slate-800 rounded-lg p-3 text-center">
                    No applications in {col.title.toLowerCase()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Follow-up Email Generator Modal */}
      {selectedAppForFollowup && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>Follow-up Outreach Generator</span>
              </h3>
              <button 
                onClick={() => setSelectedAppForFollowup(null)} 
                className="text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <div className="text-xs text-slate-400">
              Personalized follow-up message for <strong className="text-white">{selectedAppForFollowup.job_title}</strong> at <strong className="text-white">{selectedAppForFollowup.company}</strong>:
            </div>

            <textarea
              readOnly
              rows={9}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-mono leading-relaxed"
              value={generateFollowupEmail(selectedAppForFollowup)}
            />

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  const updated = {
                    ...selectedAppForFollowup,
                    follow_up_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
                  };
                  onUpdateApplication(updated);
                  setSelectedAppForFollowup(null);
                }}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Postpone Follow-up (+7 days)
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateFollowupEmail(selectedAppForFollowup));
                  setCopiedFollowup(true);
                  setTimeout(() => setCopiedFollowup(false), 2000);
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {copiedFollowup ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFollowup ? 'Copied to Clipboard!' : 'Copy Follow-up Email'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Application Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form 
            onSubmit={handleSaveNewApp}
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Track New Application</h3>
              <button 
                type="button"
                onClick={() => setIsAddModalOpen(false)} 
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Company Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Google, Snowflake"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Role Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Senior Data Analyst"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Remote, San Francisco"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Initial Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ApplicationKanbanStatus)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                >
                  <option value="saved">Saved</option>
                  <option value="applied">Applied</option>
                  <option value="assessment">Assessment</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Job URL / Application Link</label>
              <input
                type="url"
                placeholder="https://company.com/careers/..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Notes / Recruiter Contact</label>
              <input
                type="text"
                placeholder="e.g. Applied via referral, follow up next Monday"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
              >
                Save to Pipeline
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
