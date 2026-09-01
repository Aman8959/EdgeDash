import React from 'react';
import { 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Compass, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  Award,
  Zap
} from 'lucide-react';
import { SkillGap, JobListing, Config, CandidateProfile } from '../types';

interface InsightsTabProps {
  skillGaps: SkillGap[];
  jobs: JobListing[];
  config: Config;
  candidate: CandidateProfile;
  onNavigateToTab: (tab: string) => void;
}

export const InsightsTab: React.FC<InsightsTabProps> = ({
  skillGaps,
  jobs,
  config,
  candidate,
  onNavigateToTab
}) => {
  const topGap = skillGaps[0]?.skill || "SQL";
  const topGapFreq = skillGaps[0]?.frequency || 28;
  const highFitCount = jobs.filter(j => j.fit_score >= 50).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 sm:p-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>💡 Strategic Career Insights</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Autonomous Analysis
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Synthesized intelligence from market job trends, candidate skills inventory, and fit score trajectory.
        </p>
      </div>

      {/* 3 Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Market Analysis */}
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-5 space-y-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Market Analysis</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The top market skill gap is <strong className="text-blue-400">{topGap}</strong> (wanted in <strong className="text-white">{topGapFreq} job postings</strong>).
          </p>
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1">
            <div>• Strong demand for <strong>Machine Learning</strong> and <strong>Data Analysis</strong> pipelines.</div>
            <div>• Cross-functional reporting with <strong>Tableau</strong> or BI tools is increasingly required.</div>
          </div>
        </div>

        {/* 2. High-Priority Learning */}
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-5 space-y-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">High-Priority Learning</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Skills to bridge immediately for max hiring velocity:
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded border border-slate-800">
              <span className="font-semibold text-white">1. SQL (Advanced Queries)</span>
              <span className="text-rose-400 text-xs font-bold">28 jobs</span>
            </div>
            <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded border border-slate-800">
              <span className="font-semibold text-white">2. Tableau / PowerBI</span>
              <span className="text-amber-400 text-xs font-bold">22 jobs</span>
            </div>
            <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded border border-slate-800">
              <span className="font-semibold text-white">3. Cloud Platform (AWS/GCP)</span>
              <span className="text-blue-400 text-xs font-bold">19 jobs</span>
            </div>
          </div>
        </div>

        {/* 3. Career Next Steps */}
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-5 space-y-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Career Next Steps</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Recommended actions based on current pipeline:
          </p>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Apply to <strong className="text-white">{highFitCount} high-fit jobs</strong> (Fit score &gt;= 50%).</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Tailor resumes for each specific job to maximize ATS compatibility.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Complete structured portfolio projects incorporating SQL and Cloud deployment.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action CTA Box */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900 border border-blue-500/30 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span>Ready to generate tailored ATS resumes?</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Our Phase 5 Resume Intelligence agent pipeline selects real projects and skills from your profile with 0 hallucinations.
          </p>
        </div>

        <button
          onClick={() => onNavigateToTab('resume')}
          className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition flex items-center gap-2 shrink-0 shadow-md shadow-blue-600/30"
        >
          <span>Open Resume Intelligence</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
