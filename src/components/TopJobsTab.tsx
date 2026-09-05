import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Globe, 
  Building2,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  AlertCircle,
  Send,
  Briefcase,
  RefreshCw,
  Radio,
  Zap,
  Check
} from 'lucide-react';
import { JobListing, Config } from '../types';

interface TopJobsTabProps {
  jobs: JobListing[];
  config: Config;
  onSelectJobForResume: (job: JobListing) => void;
  onApplyJob: (job: JobListing) => void;
  onFetchLiveJobs?: (query?: string) => Promise<void>;
  isFetchingLive?: boolean;
  liveFetchMsg?: string | null;
}

export const TopJobsTab: React.FC<TopJobsTabProps> = ({
  jobs,
  config,
  onSelectJobForResume,
  onApplyJob,
  onFetchLiveJobs,
  isFetchingLive = false,
  liveFetchMsg = null
}) => {
  const [minFitScore, setMinFitScore] = useState<number>(config.min_fit_score);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  // Derive all unique sources present in the jobs data dynamically
  const availableSources = Array.from(new Set(jobs.map(j => j.source))).filter(Boolean);

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    if (job.fit_score < minFitScore) return false;
    if (sourceFilter !== 'all' && job.source !== sourceFilter) return false;
    if (statusFilter === 'applied') {
      if (job.application_status !== 'applied' && job.application_status !== 'interviewing' && job.application_status !== 'offered') return false;
    } else if (statusFilter === 'interviewing') {
      if (job.application_status !== 'interviewing') return false;
    } else if (statusFilter === 'not_applied') {
      if (job.application_status && job.application_status !== 'not_applied') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = job.title.toLowerCase().includes(q);
      const matchComp = job.company.toLowerCase().includes(q);
      const matchDesc = job.description.toLowerCase().includes(q);
      const matchLoc = job.location.toLowerCase().includes(q);
      if (!matchTitle && !matchComp && !matchDesc && !matchLoc) return false;
    }
    return true;
  });

  const appliedCount = jobs.filter(j => j.application_status === 'applied' || j.application_status === 'interviewing' || j.application_status === 'offered').length;

  const getBadgeInfo = (score: number) => {
    if (score >= 50) {
      return { label: '🔥 HOT', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
    }
    if (score >= 40) {
      return { label: '✓ GOOD', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    }
    return { label: '• OK', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
  };

  return (
    <div className="space-y-6">
      {/* Live API Integration Status Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-800/50 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" /> Live Job Portal APIs:
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                Jobicy API (Active)
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
                Remotive API (Active)
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
                Arbeitnow API (Active)
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Real jobs are ingested directly from verified public job APIs without simulated placeholders.
            </p>
          </div>
        </div>

        {onFetchLiveJobs && (
          <button
            id="btn-fetch-live-jobs"
            onClick={() => onFetchLiveJobs(searchQuery)}
            disabled={isFetchingLive}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5 whitespace-nowrap self-stretch sm:self-auto justify-center ${
              isFetchingLive
                ? 'bg-blue-600/50 text-blue-200 cursor-wait'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30 hover:shadow-blue-900/50'
            }`}
            title="Hit live APIs now to pull fresh job postings"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetchingLive ? 'animate-spin' : ''}`} />
            <span>{isFetchingLive ? 'Connecting to APIs...' : '⚡ Fetch Real Live Jobs'}</span>
          </button>
        )}
      </div>

      {liveFetchMsg && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-700/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{liveFetchMsg}</span>
        </div>
      )}

      {/* Header Info Banner */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📋 Top Job Matches</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/30">
                {filteredJobs.length} matching
              </span>
            </h2>
            {appliedCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {appliedCount} Applied
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Targeting <strong>{config.target_role}</strong> in <strong>{config.target_city}</strong> • Experience: {config.experience_years} years
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400">Min Fit:</span>
            <span className="text-xs font-bold text-blue-400">{minFitScore}%</span>
            <input
              id="slider-min-fit-score"
              type="range"
              min="0"
              max="100"
              value={minFitScore}
              onChange={(e) => setMinFitScore(Number(e.target.value))}
              className="w-20 accent-blue-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-jobs"
              type="text"
              placeholder="Search title, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900/80 border border-slate-700 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 w-40 sm:w-48"
            />
          </div>

          <select
            id="select-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900/80 border border-slate-700 text-xs text-slate-300 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="applied">Applied ({appliedCount})</option>
            <option value="interviewing">Interviewing</option>
            <option value="not_applied">Not Applied</option>
          </select>

          <select
            id="select-source-filter"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-slate-900/80 border border-slate-700 text-xs text-slate-300 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 max-w-[170px]"
          >
            <option value="all">All Sources ({jobs.length})</option>
            {availableSources.map(src => (
              <option key={src} value={src}>{src}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No jobs found matching your filter</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Try lowering the minimum fit score slider (current: {minFitScore}%) or adjusting status/source filters.
          </p>
          <button
            onClick={() => { setMinFitScore(0); setSearchQuery(''); setSourceFilter('all'); setStatusFilter('all'); }}
            className="mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job, idx) => {
            const badge = getBadgeInfo(job.fit_score);
            const isExpanded = expandedJobId === job.id;
            const isApplied = job.application_status === 'applied';
            const isInterviewing = job.application_status === 'interviewing';
            const isOffered = job.application_status === 'offered';

            return (
              <div
                key={job.id}
                id={`job-card-${job.id}`}
                className={`bg-slate-800/40 hover:bg-slate-800/70 border rounded-xl p-4 sm:p-5 transition ${
                  isApplied ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-700/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                        #{idx + 1}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white hover:text-blue-400 transition">
                        {job.title}
                      </h3>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${badge.bg}`}>
                        {badge.label}
                      </span>

                      {/* Application Status Badge */}
                      {isApplied && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Applied {job.applied_date ? `(${job.applied_date})` : ''}</span>
                        </span>
                      )}

                      {isInterviewing && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/50 font-bold flex items-center gap-1">
                          <span>📅 Interviewing</span>
                        </span>
                      )}

                      {isOffered && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold flex items-center gap-1">
                          <span>🎉 Offer Received</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-medium text-slate-300">
                        <Building2 className="w-3.5 h-3.5 text-blue-400" />
                        {job.company}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.location}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        Source: {job.source}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {job.posted_at ? job.posted_at.slice(0, 10) : 'Recent'}
                      </span>
                    </div>

                    {/* Fit Reason Tag */}
                    {job.fit_reason && (
                      <div className="text-xs text-slate-300 bg-slate-900/60 rounded-md px-2.5 py-1.5 inline-block border border-slate-700/60 mt-1">
                        <strong className="text-blue-400">Why: </strong>
                        {job.fit_reason}
                      </div>
                    )}
                  </div>

                  {/* Right Score & Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-medium">Fit Score</div>
                      <div className="text-2xl font-black text-white flex items-baseline gap-1">
                        <span>{job.fit_score}</span>
                        <span className="text-xs text-slate-500 font-normal">/100</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* APPLY / TRACK BUTTON */}
                      <button
                        id={`btn-apply-job-${job.id}`}
                        onClick={() => onApplyJob(job)}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 ${
                          isApplied
                            ? 'bg-emerald-600/90 hover:bg-emerald-600 text-white border border-emerald-400/40'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
                        }`}
                        title="1-Click Direct Apply, Email Outreach, Cover Letter & Status Tracking"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isApplied ? `Applied (${job.application_ref ? '#' + job.application_ref.slice(-4) : '✓'})` : '⚡ Direct Apply'}</span>
                      </button>

                      <button
                        id={`btn-resume-for-${job.id}`}
                        onClick={() => onSelectJobForResume(job)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition flex items-center gap-1.5"
                        title="Generate Tailored Resume for this Job"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Tailor Resume</span>
                      </button>

                      <button
                        id={`btn-expand-${job.id}`}
                        onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                        className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 transition"
                        title={isExpanded ? "Collapse" : "View full description"}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collapsible Full Description */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-700/80 space-y-3 text-xs sm:text-sm text-slate-300">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-200">Full Job Description:</div>
                      <button
                        onClick={() => onApplyJob(job)}
                        className="text-xs px-3 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-600/30 flex items-center gap-1 font-semibold"
                      >
                        <Send className="w-3 h-3" />
                        <span>Open Application Kit & Apply</span>
                      </button>
                    </div>
                    <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 text-slate-300 font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {job.description}
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>Listing ID: {job.id}</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onApplyJob(job)}
                          className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 shadow-sm transition"
                        >
                          <Send className="w-3 h-3" />
                          <span>{isApplied ? 'Application Submitted (View/Update)' : '⚡ 1-Click Direct Apply'}</span>
                        </button>
                        {job.url && (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <span>Official Source</span> <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

