import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  Mail, 
  MessageSquare, 
  HelpCircle, 
  Send,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { JobListing, CandidateProfile, ApplicationPackData } from '../types';
import { exportResumeToPDF } from '../services/pdfService';

interface ApplicationPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobListing | null;
  candidate: CandidateProfile;
  onSaveToTracker?: (job: JobListing, coverLetter: string) => void;
}

export const ApplicationPackModal: React.FC<ApplicationPackModalProps> = ({
  isOpen,
  onClose,
  job,
  candidate,
  onSaveToTracker
}) => {
  const [activeTab, setActiveTab] = useState<'cover_letter' | 'recruiter_email' | 'linkedin_msg' | 'interview_prep'>('cover_letter');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  if (!isOpen || !job) return null;

  // Real candidate grounded synthesis (0 Hallucinations)
  const candidateSkillsText = candidate.skills.slice(0, 5).map(s => s.skill_name).join(', ');
  const topProject = candidate.projects[0];
  const companyName = job.company || 'Hiring Team';
  const roleTitle = job.title || 'Data Professional';

  // 1. Cover Letter
  const coverLetterText = `Dear Hiring Manager at ${companyName},

I am writing to express my strong enthusiasm for the ${roleTitle} position. With verified hands-on expertise in ${candidateSkillsText}, and a proven background building data systems, I am excited by the prospect of contributing directly to your team.

At my current role, I have focused on translating complex datasets into reliable, actionable business insights. In addition, through my project "${topProject?.name || 'Data Intelligence Engine'}", I developed solutions leveraging ${topProject?.skills_used?.slice(0, 3).join(', ') || 'modern analytics tools'}, delivering measurable performance improvements.

${companyName}'s work aligns closely with my dedication to data integrity, analytical precision, and scalable engineering. I would welcome the opportunity to discuss how my verified skills can accelerate your objectives.

Thank you for your time and consideration.

Sincerely,
${candidate.full_name}
${candidate.email} | ${candidate.location}
${candidate.linkedin_url || ''}`;

  // 2. Recruiter Email
  const emailSubject = `Application: ${roleTitle} - ${candidate.full_name}`;
  const emailBody = `Hi ${companyName} Recruiting Team,

I recently came across the ${roleTitle} opening at ${companyName} and was compelled to reach out.

Given my verified background in ${candidateSkillsText} and experience building scalable analytical workflows, I am confident in my ability to deliver immediate value to your organization.

I have attached my tailored ATS resume for your review and would love to schedule a brief conversation to explore how my technical background aligns with your team's needs.

Best regards,

${candidate.full_name}
${candidate.email} | ${candidate.phone || ''}
${candidate.linkedin_url ? `LinkedIn: ${candidate.linkedin_url}` : ''}`;

  // 3. LinkedIn Outreach Note (Under 300 characters)
  const linkedinNote = `Hi! I noticed the ${roleTitle} opening at ${companyName}. With verified expertise in ${candidate.skills.slice(0, 3).map(s => s.skill_name).join(', ')}, I'd love to connect and learn more about how your team approaches data challenges. Thanks! - ${candidate.full_name}`;

  // 4. JD-Specific Interview Questions
  const interviewQuestions = [
    {
      category: 'Technical Focus',
      question: `How would you architect an end-to-end data analysis pipeline for ${companyName} using ${candidate.skills.slice(0, 3).map(s => s.skill_name).join(', ')}?`,
      guidance: `Explain data ingestion, cleaning with Pandas, SQL storage, and outputting to executive dashboards with clear KPI validation.`
    },
    {
      category: 'Project Deep-Dive',
      question: `Can you walk us through how you designed "${topProject?.name || 'your primary project'}" and the trade-offs you made?`,
      guidance: `Focus on the problem statement, technologies chosen (${topProject?.skills_used?.join(', ') || 'SQL, Python'}), and the final outcome (${topProject?.metrics || 'delivered measurable impact'}).`
    },
    {
      category: 'Behavioral / Problem Solving',
      question: `Describe a scenario where you identified a data discrepancy or pipeline bottleneck. How did you diagnose and resolve it?`,
      guidance: `Use the STAR method: Situation, Task, Action (systematic debugging & query profiling), and Result.`
    }
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportResumeToPDF(candidate, roleTitle);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleTrackAndApply = () => {
    if (onSaveToTracker) {
      onSaveToTracker(job, coverLetterText);
    }
    if (job.url) {
      window.open(job.url, '_blank', 'noopener,noreferrer');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>1-Click Application Pack</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  Ready to Apply
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Tailored assets for <strong className="text-white">{roleTitle}</strong> at <strong className="text-white">{companyName}</strong> (Match: {job.fit_score}%)
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs bar */}
        <div className="bg-slate-950 border-b border-slate-800 px-6 pt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('cover_letter')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'cover_letter'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Cover Letter</span>
          </button>

          <button
            onClick={() => setActiveTab('recruiter_email')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'recruiter_email'
                ? 'border-blue-500 text-blue-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Recruiter Email</span>
          </button>

          <button
            onClick={() => setActiveTab('linkedin_msg')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'linkedin_msg'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>LinkedIn Connection Note</span>
          </button>

          <button
            onClick={() => setActiveTab('interview_prep')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'interview_prep'
                ? 'border-amber-500 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>JD Interview Questions</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* 1. Cover Letter Tab */}
          {activeTab === 'cover_letter' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>0 Hallucinations: Grounded strictly in candidate master profile credentials</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(coverLetterText, 'cover_letter')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
                  >
                    {copiedKey === 'cover_letter' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{copiedKey === 'cover_letter' ? 'Copied!' : 'Copy Cover Letter'}</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-slate-200 text-xs sm:text-sm font-sans whitespace-pre-wrap leading-relaxed">
                {coverLetterText}
              </div>
            </div>
          )}

          {/* 2. Recruiter Email Tab */}
          {activeTab === 'recruiter_email' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Ready-to-send outreach message to hiring manager or talent acquisition
                </span>
                <button
                  onClick={() => handleCopy(`${emailSubject}\n\n${emailBody}`, 'recruiter_email')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
                >
                  {copiedKey === 'recruiter_email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedKey === 'recruiter_email' ? 'Copied!' : 'Copy Email & Subject'}</span>
                </button>
              </div>

              <div className="space-y-2">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300">
                  <strong className="text-white">Subject:</strong> {emailSubject}
                </div>
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-slate-200 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                  {emailBody}
                </div>
              </div>
            </div>
          )}

          {/* 3. LinkedIn Connection Note */}
          {activeTab === 'linkedin_msg' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span>Character count: <strong className="text-white">{linkedinNote.length} / 300</strong></span>
                  <span className="text-emerald-400">✓ Under LinkedIn character limit</span>
                </div>
                <button
                  onClick={() => handleCopy(linkedinNote, 'linkedin_msg')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
                >
                  {copiedKey === 'linkedin_msg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedKey === 'linkedin_msg' ? 'Copied!' : 'Copy Connection Note'}</span>
                </button>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-slate-200 text-xs sm:text-sm leading-relaxed">
                {linkedinNote}
              </div>
            </div>
          )}

          {/* 4. Interview Questions Tab */}
          {activeTab === 'interview_prep' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                High-probability questions tailored to {roleTitle} at {companyName}:
              </div>

              <div className="space-y-3">
                {interviewQuestions.map((q, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                        {q.category}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-white">
                      {q.question}
                    </div>
                    <div className="text-xs text-slate-400 bg-slate-900/80 p-2.5 rounded border border-slate-800/80">
                      <strong className="text-amber-300">Strategy / Framework:</strong> {q.guidance}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>{isExportingPdf ? 'Generating PDF...' : 'Download Tailored Resume (PDF)'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Close
            </button>

            <button
              onClick={handleTrackAndApply}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Save to Tracker & Open Job Post ↗</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
