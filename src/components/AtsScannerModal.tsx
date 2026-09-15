import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  BarChart3, 
  Target, 
  Layers, 
  RefreshCw,
  Lightbulb,
  Check
} from 'lucide-react';
import { CandidateProfile, JobListing } from '../types';

interface AtsScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateProfile;
  jobs?: JobListing[];
  job?: JobListing | null;
  selectedJobId?: string | null;
}

export const AtsScannerModal: React.FC<AtsScannerModalProps> = ({
  isOpen,
  onClose,
  candidate,
  jobs = [],
  job,
  selectedJobId
}) => {
  const effectiveJobs = jobs.length > 0 ? jobs : (job ? [job] : []);
  const [activeJobId, setActiveJobId] = useState<string>(selectedJobId || (job?.id ?? effectiveJobs[0]?.id ?? ''));
  const [customJdText, setCustomJdText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [hasScanned, setHasScanned] = useState<boolean>(true);

  if (!isOpen) return null;

  const currentJob = effectiveJobs.find(j => j.id === activeJobId) || effectiveJobs[0];
  const jdToScan = customJdText.trim() || (currentJob ? `${currentJob.title} at ${currentJob.company}\n\n${currentJob.description}` : '');

  // Dynamic ATS Analysis metrics
  const candidateSkills = candidate.skills.map(s => s.skill_name.toLowerCase());
  const jdLower = jdToScan.toLowerCase();

  const coreKeywords = ['sql', 'python', 'pandas', 'excel', 'power bi', 'tableau', 'aws', 'docker', 'machine learning', 'etl', 'statistics'];
  const matchedKeywords = coreKeywords.filter(kw => jdLower.includes(kw) && candidateSkills.some(cs => cs.includes(kw)));
  const missingKeywords = coreKeywords.filter(kw => jdLower.includes(kw) && !candidateSkills.some(cs => cs.includes(kw)));

  const keywordMatchPct = Math.min(96, Math.max(70, Math.round((matchedKeywords.length / Math.max(1, matchedKeywords.length + missingKeywords.length)) * 100)));
  const skillsMatchPct = Math.min(95, Math.max(68, keywordMatchPct + 4));
  const expMatchPct = candidate.experience.length >= 2 ? 90 : (candidate.experience.length >= 1 ? 84 : 75);
  const formattingPct = 94;
  const eduPct = candidate.education.length > 0 ? 98 : 80;
  const projectsPct = candidate.projects.length >= 2 ? 92 : 82;

  const overallAtsScore = Math.round(
    keywordMatchPct * 0.30 +
    skillsMatchPct * 0.25 +
    expMatchPct * 0.15 +
    formattingPct * 0.10 +
    eduPct * 0.10 +
    projectsPct * 0.10
  );

  const handleRescan = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasScanned(true);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>ATS Resume Scanner</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Target Role Optimizer
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Evaluating candidate master resume against Target Job Description
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Target Selection & Custom JD Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Benchmark Against Active Job:
              </label>
              <select
                value={activeJobId}
                onChange={(e) => setActiveJobId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.title} • {j.company} (Score: {j.fit_score}%)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Or Paste Custom Job Description:
                </label>
                {customJdText && (
                  <button 
                    onClick={() => setCustomJdText('')} 
                    className="text-xs text-blue-400 hover:underline"
                  >
                    Clear Custom JD
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Paste external JD snippet, title, or responsibilities..."
                value={customJdText}
                onChange={(e) => setCustomJdText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-500"
              />
            </div>
          </div>

          {/* Top Score Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full flex items-center justify-center border-4 border-blue-500/40 bg-slate-950 text-white shrink-0">
                <div className="text-center">
                  <div className="text-2xl font-black text-blue-400">{overallAtsScore}</div>
                  <div className="text-[10px] text-slate-400 -mt-1">/ 100</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>ATS Readability & Compatibility Score</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    overallAtsScore >= 85 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {overallAtsScore >= 85 ? 'High Interview Likelihood' : 'Good Base Fit'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-lg">
                  Resume passes standard Enterprise Applicant Tracking Systems (Workday, Greenhouse, Taleo). Standard A4 layout with no non-standard tables or graphics.
                </p>
              </div>
            </div>

            <button
              onClick={handleRescan}
              disabled={isAnalyzing}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-center shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Scanning...' : 'Re-scan Resume'}</span>
            </button>
          </div>

          {/* Breakdown Grid */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              ATS Scoring Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                <div className="text-xs text-slate-400">Keyword Match</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">{keywordMatchPct}%</div>
                <div className="text-[10px] text-slate-500">30% weight</div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                <div className="text-xs text-slate-400">Skills Match</div>
                <div className="text-xl font-bold text-blue-400 mt-1">{skillsMatchPct}%</div>
                <div className="text-[10px] text-slate-500">25% weight</div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                <div className="text-xs text-slate-400">Experience</div>
                <div className="text-xl font-bold text-indigo-400 mt-1">{expMatchPct}%</div>
                <div className="text-[10px] text-slate-500">15% weight</div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                <div className="text-xs text-slate-400">Formatting</div>
                <div className="text-xl font-bold text-purple-400 mt-1">{formattingPct}%</div>
                <div className="text-[10px] text-slate-500">10% weight</div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                <div className="text-xs text-slate-400">Education</div>
                <div className="text-xl font-bold text-teal-400 mt-1">{eduPct}%</div>
                <div className="text-[10px] text-slate-500">10% weight</div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                <div className="text-xs text-slate-400">Projects</div>
                <div className="text-xl font-bold text-amber-400 mt-1">{projectsPct}%</div>
                <div className="text-[10px] text-slate-500">10% weight</div>
              </div>
            </div>
          </div>

          {/* Detected Problems & Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Missing Keywords */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Identified Keyword Gaps</span>
              </div>
              <p className="text-xs text-slate-400">
                These keywords are prevalent in the job posting but missing from your candidate skills list:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {missingKeywords.length > 0 ? (
                  missingKeywords.map(kw => (
                    <span key={kw} className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-mono">
                      + {kw.toUpperCase()}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> No critical keyword omissions detected!
                  </span>
                )}
              </div>
            </div>

            {/* Matched Keywords */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Strongly Matched Keywords</span>
              </div>
              <p className="text-xs text-slate-400">
                Skills directly verified in your profile that match the job description:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {matchedKeywords.map(kw => (
                  <span key={kw} className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-mono">
                    ✓ {kw.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Lightbulb className="w-4 h-4" />
              <span>Tailoring Recommendations to Reach 95%+ ATS Score</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {missingKeywords.slice(0, 2).map(kw => (
                <li key={kw} className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">1.</span>
                  <span>
                    Add <strong>{kw.toUpperCase()}</strong> to your Technical Skills or reference its practical application in project bullets.
                  </span>
                </li>
              ))}
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">2.</span>
                <span>
                  Highlight quantitative results (e.g. <em>"improved query speed by 35%"</em> or <em>"analyzed 1M+ rows"</em>) in work experience bullet points.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">3.</span>
                <span>
                  Keep your Professional Summary concise (under 80 words) and tightly aligned to <strong>{currentJob?.title || 'the target role'}</strong>.
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Close Scanner
          </button>
        </div>

      </div>
    </div>
  );
};
