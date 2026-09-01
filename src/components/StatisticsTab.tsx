import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  Briefcase, 
  Code, 
  Layers, 
  Flame,
  CheckCircle2
} from 'lucide-react';
import { JobListing, Config, CandidateProfile } from '../types';

interface StatisticsTabProps {
  jobs: JobListing[];
  config: Config;
  candidate: CandidateProfile;
}

export const StatisticsTab: React.FC<StatisticsTabProps> = ({
  jobs,
  config,
  candidate
}) => {
  const totalListings = jobs.length;
  const scoredJobs = jobs.filter(j => j.fit_score !== undefined && j.fit_score !== null);
  const avgFitScore = scoredJobs.length > 0
    ? Math.round(scoredJobs.reduce((acc, j) => acc + j.fit_score, 0) / scoredJobs.length)
    : 0;
  
  const highFitJobs = scoredJobs.filter(j => j.fit_score >= 50).length;
  const medFitJobs = scoredJobs.filter(j => j.fit_score >= 20 && j.fit_score < 50).length;
  const lowFitJobs = scoredJobs.filter(j => j.fit_score < 20).length;

  const distributionData = [
    { name: 'High Fit (50-100)', count: highFitJobs, color: '#10b981' },
    { name: 'Medium Fit (20-49)', count: medFitJobs, color: '#f59e0b' },
    { name: 'Low Fit (0-19)', count: lowFitJobs, color: '#ef4444' }
  ];

  const sourceCounts: Record<string, number> = {};
  jobs.forEach(j => {
    sourceCounts[j.source] = (sourceCounts[j.source] || 0) + 1;
  });
  const sourceData = Object.entries(sourceCounts).map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-6">
      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-4 sm:p-5">
          <div className="text-xs text-slate-400 font-medium">Total Listings</div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">{totalListings}</div>
          <div className="text-xs text-slate-500 mt-1">Fetched across sources</div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-4 sm:p-5">
          <div className="text-xs text-slate-400 font-medium">Scored Jobs</div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-1">{scoredJobs.length}</div>
          <div className="text-xs text-slate-500 mt-1">100% processed by Scorer</div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-4 sm:p-5">
          <div className="text-xs text-slate-400 font-medium">Average Fit Score</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">{avgFitScore}%</div>
          <div className="text-xs text-slate-500 mt-1">Weighted: 30% kw, 70% skill</div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-4 sm:p-5">
          <div className="text-xs text-slate-400 font-medium">High-Fit Jobs (50+)</div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-1 flex items-baseline gap-1">
            <span>{highFitJobs}</span>
            <span className="text-xs text-slate-500 font-normal">({totalListings ? Math.round((highFitJobs / totalListings) * 100) : 0}%)</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Ready for application</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span>Fit Score Distribution</span>
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                  formatter={(value: any) => [`${value} jobs`, 'Count']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Breakdown */}
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Job Sources Breakdown</span>
          </h3>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 5 }}>
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Code className="w-4 h-4 text-emerald-400" />
            <span>Candidate Verified Skills ({candidate.skills.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Used for weighted skill matching & resume generation</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {candidate.skills.map((skill) => (
            <div 
              key={skill.skill_name}
              className="bg-slate-900/60 border border-slate-700/60 rounded-lg p-3 hover:border-slate-600 transition"
            >
              <div className="font-semibold text-white text-xs sm:text-sm">{skill.skill_name}</div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                <span className="text-blue-400">{skill.proficiency}</span>
                <span>{skill.years_of_experience} yrs</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
