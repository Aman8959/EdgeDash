import React from 'react';
import { 
  Bot, 
  Play, 
  User, 
  PlusCircle, 
  Sparkles, 
  Layers,
  MapPin,
  Briefcase
} from 'lucide-react';
import { Config, CandidateProfile } from '../types';

interface NavbarProps {
  config: Config;
  candidate: CandidateProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRunCycle: () => void;
  onOpenProfile: () => void;
  onOpenAddJob: () => void;
  isCycling: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  candidate,
  activeTab,
  setActiveTab,
  onRunCycle,
  onOpenProfile,
  onOpenAddJob,
  isCycling
}) => {
  const tabs = [
    { id: 'jobs', label: '📋 Top Jobs' },
    { id: 'gaps', label: '🎯 Skill Gaps' },
    { id: 'stats', label: '📈 Statistics' },
    { id: 'insights', label: '💡 Insights' },
    { id: 'resume', label: '📄 Resume Intelligence' }
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">EdgeDash</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-medium">
                  9 Autonomous Agents
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 hidden sm:flex">
                <span className="flex items-center gap-1"><Briefcase className="w-3 h-3 text-slate-500" /> {config.target_role}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-500" /> {config.target_city}</span>
                <span>•</span>
                <span>{config.experience_years}y exp</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="btn-add-job"
              onClick={onOpenAddJob}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Add Custom Job Listing"
            >
              <PlusCircle className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Add Job</span>
            </button>

            <button
              id="btn-candidate-profile"
              onClick={onOpenProfile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="View Candidate Profile"
            >
              <User className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">{candidate.full_name}</span>
            </button>

            <button
              id="btn-run-cycle"
              onClick={onRunCycle}
              disabled={isCycling}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/25 transition disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${isCycling ? 'animate-spin' : ''}`} />
              <span>{isCycling ? 'Running Cycle...' : 'Run 9-Agent Cycle'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 sm:space-x-2 border-t border-slate-800/80 pt-1 pb-2 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
