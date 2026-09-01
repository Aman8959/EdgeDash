import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { 
  Target, 
  TrendingUp, 
  BookOpen, 
  Plus, 
  CheckCircle2, 
  Flame,
  Sparkles 
} from 'lucide-react';
import { SkillGap, Config, CandidateProfile } from '../types';

interface SkillGapsTabProps {
  skillGaps: SkillGap[];
  config: Config;
  candidate: CandidateProfile;
  onAddSkillToCandidate: (skillName: string) => void;
}

export const SkillGapsTab: React.FC<SkillGapsTabProps> = ({
  skillGaps,
  config,
  candidate,
  onAddSkillToCandidate
}) => {
  const candidateSkillNames = new Set(candidate.skills.map(s => s.skill_name.toLowerCase()));

  // Chart data
  const chartData = skillGaps.map(g => ({
    name: g.skill,
    demand: g.frequency,
    isLearned: candidateSkillNames.has(g.skill.toLowerCase())
  }));

  const getPriority = (freq: number) => {
    if (freq >= 15) return { label: '🔥 Critical', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
    if (freq >= 8) return { label: '📈 High', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    return { label: '• Moderate', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
  };

  const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#14b8a6', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Header Overview Banner */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🎯 Market Skill Gap Analysis</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              GapAnalyzer Agent
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Analyzing job postings across the market to uncover high-demand skills missing from your candidate profile.
          </p>
        </div>

        <div className="bg-slate-900/80 px-4 py-2.5 rounded-lg border border-slate-700 text-xs">
          <div className="text-slate-400 font-medium">Top Priority To Learn:</div>
          <div className="text-sm font-bold text-amber-400 flex items-center gap-1.5 mt-0.5">
            <Flame className="w-4 h-4 text-rose-400" />
            {skillGaps[0]?.skill || "SQL"} ({skillGaps[0]?.frequency || 0} job mentions)
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <span>Market Skill Gaps Frequency (Job Postings Demand)</span>
        </h3>
        
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: '#f8fafc'
                }}
                formatter={(value: any) => [`${value} job listings`, 'Market Demand']}
              />
              <Bar dataKey="demand" radius={[4, 4, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Section: Table & Learning Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table of Top Gaps (2 cols on lg) */}
        <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700/80 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
            <span>Top Gaps to Learn</span>
            <span className="text-xs text-slate-400">Ranked by hiring demand</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Skill</th>
                  <th className="py-2.5 px-3">Market Demand</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {skillGaps.map((gap, index) => {
                  const priority = getPriority(gap.frequency);
                  const isAdded = candidateSkillNames.has(gap.skill.toLowerCase());

                  return (
                    <tr key={gap.skill} className="hover:bg-slate-800/50 transition">
                      <td className="py-3 px-3 text-slate-500 font-mono">
                        {index + 1}
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">
                        {gap.skill}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        <span className="font-bold text-blue-400">{gap.frequency}</span> jobs
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${priority.color}`}>
                          {priority.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isAdded ? (
                          <span className="text-emerald-400 font-medium inline-flex items-center gap-1 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Added
                          </span>
                        ) : (
                          <button
                            id={`btn-add-skill-${gap.skill}`}
                            onClick={() => onAddSkillToCandidate(gap.skill)}
                            className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium inline-flex items-center gap-1 transition"
                            title="Add skill to candidate master profile"
                          >
                            <Plus className="w-3 h-3" /> Add to Profile
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Quick Strategy & Learning Pathways */}
        <div className="space-y-4">
          <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Recommended Learning Path</span>
            </h3>
            
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Phase 1: Database & BI Mastery
                </div>
                <p className="text-slate-400 mt-1">
                  Master <strong>SQL</strong> complex aggregations, window functions, and connect to <strong>Tableau</strong> or PowerBI for interactive stakeholder dashboards.
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Phase 2: Cloud & MLOps
                </div>
                <p className="text-slate-400 mt-1">
                  Learn <strong>AWS</strong> (S3, SageMaker, Lambda) or GCP (BigQuery, Vertex) and package pipelines with <strong>Docker</strong>.
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Phase 3: Big Data Scale
                </div>
                <p className="text-slate-400 mt-1">
                  Integrate distributed processing with <strong>PySpark</strong> and streaming analytics via <strong>Kafka</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-500/20 rounded-xl p-4 text-xs text-slate-300 space-y-2">
            <div className="font-bold text-blue-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Candidate Alignment Score
            </div>
            <p className="text-slate-400">
              Your profile currently holds <strong>{candidate.skills.length} verified skills</strong> across Machine Learning, Python, and Statistics. Adding <strong>SQL</strong> and <strong>Tableau</strong> unlocks ~40% higher market fit across senior postings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
