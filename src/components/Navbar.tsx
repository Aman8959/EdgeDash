import React from 'react';
import { 
  Bot, 
  Play, 
  User, 
  PlusCircle, 
  Sparkles, 
  Layers,
  MapPin,
  Briefcase,
  LogOut,
  HelpCircle
} from 'lucide-react';
import { Config, CandidateProfile } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { InfoModalType } from './InfoModal';

interface NavbarProps {
  config: Config;
  candidate: CandidateProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRunCycle: () => void;
  onOpenProfile: () => void;
  onOpenAddJob: () => void;
  isCycling: boolean;
  currentUser?: FirebaseUser | null;
  onSignOut?: () => void;
  onOpenInfo?: (type: InfoModalType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  candidate,
  activeTab,
  setActiveTab,
  onRunCycle,
  onOpenProfile,
  onOpenAddJob,
  isCycling,
  currentUser,
  onSignOut,
  onOpenInfo
}) => {
  const tabs = [
    { id: 'jobs', label: '📋 Top Jobs' },
    { id: 'gaps', label: '🎯 Skill Gaps' },
    { id: 'stats', label: '📈 Statistics' },
    { id: 'insights', label: '💡 Insights' },
    { id: 'resume', label: '📄 Resume Intelligence' }
  ];

  const userDisplayName = currentUser?.displayName || candidate.full_name || currentUser?.email?.split('@')[0] || 'Aman Kumar Yadav';
  const userInitial = userDisplayName.charAt(0).toUpperCase();

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
            {onOpenInfo && (
              <button
                id="btn-nav-faqs"
                onClick={() => onOpenInfo('faqs')}
                className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
                title="View FAQs & Help"
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>FAQs</span>
              </button>
            )}

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
              <span>{isCycling ? 'Running Pipeline...' : 'Run Pipeline'}</span>
            </button>

            {/* Authenticated User Avatar & Sign Out */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div 
                  className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-blue-500/30 shrink-0"
                  title={currentUser.email || userDisplayName}
                >
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={userDisplayName} 
                      className="w-full h-full rounded-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </div>

                {onSignOut && (
                  <button
                    id="btn-sign-out"
                    onClick={onSignOut}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition"
                    title="Sign Out of EdgeDash"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
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
