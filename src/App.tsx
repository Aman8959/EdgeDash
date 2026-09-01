import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TopJobsTab } from './components/TopJobsTab';
import { SkillGapsTab } from './components/SkillGapsTab';
import { StatisticsTab } from './components/StatisticsTab';
import { InsightsTab } from './components/InsightsTab';
import { ResumeIntelligenceTab } from './components/ResumeIntelligenceTab';
import { AgentCycleModal } from './components/AgentCycleModal';
import { CandidateProfileModal } from './components/CandidateProfileModal';
import { AddJobModal } from './components/AddJobModal';

import { 
  defaultConfig, 
  defaultCandidateProfile, 
  defaultInitialListings, 
  defaultSkillGaps 
} from './data/defaultData';
import { CandidateProfile, Config, JobListing, SkillGap } from './types';
import { IndeedFetcher, Scorer, GapAnalyzer, Verifier } from './services/agents';

export function App() {
  // State initialization with localStorage fallback
  const [config, setConfig] = useState<Config>(() => {
    const saved = localStorage.getItem('edgedash_config');
    return saved ? JSON.parse(saved) : defaultConfig;
  });

  const [candidate, setCandidate] = useState<CandidateProfile>(() => {
    const saved = localStorage.getItem('edgedash_candidate');
    return saved ? JSON.parse(saved) : defaultCandidateProfile;
  });

  const [jobs, setJobs] = useState<JobListing[]>(() => {
    const saved = localStorage.getItem('edgedash_jobs');
    return saved ? JSON.parse(saved) : defaultInitialListings;
  });

  const [skillGaps, setSkillGaps] = useState<SkillGap[]>(() => {
    const saved = localStorage.getItem('edgedash_gaps');
    return saved ? JSON.parse(saved) : defaultSkillGaps;
  });

  const [activeTab, setActiveTab] = useState<string>('jobs');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(jobs[0]?.id || null);

  // Modals
  const [isCycleModalOpen, setIsCycleModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState<boolean>(false);
  const [isCycling, setIsCycling] = useState<boolean>(false);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('edgedash_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('edgedash_candidate', JSON.stringify(candidate));
  }, [candidate]);

  useEffect(() => {
    localStorage.setItem('edgedash_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('edgedash_gaps', JSON.stringify(skillGaps));
  }, [skillGaps]);

  // Handler: Tailor resume from job card
  const handleSelectJobForResume = (job: JobListing) => {
    setSelectedJobId(job.id);
    setActiveTab('resume');
  };

  // Handler: Add custom job
  const handleAddJob = (newJob: JobListing) => {
    const updated = [newJob, ...jobs];
    setJobs(updated);
    // Recalculate gaps
    const newGaps = GapAnalyzer.analyze(updated, config);
    setSkillGaps(newGaps);
  };

  // Handler: Add skill to candidate
  const handleAddSkillToCandidate = (skillName: string) => {
    const exists = candidate.skills.some(
      s => s.skill_name.toLowerCase() === skillName.toLowerCase()
    );
    if (exists) return;

    const updatedProfile: CandidateProfile = {
      ...candidate,
      skills: [
        ...candidate.skills,
        {
          skill_name: skillName,
          proficiency: 'Advanced',
          years_of_experience: 2,
          category: 'Technical',
          endorsements: 5
        }
      ]
    };
    setCandidate(updatedProfile);

    // Re-score jobs with updated candidate skills
    const updatedConfig: Config = {
      ...config,
      my_skills: [...config.my_skills, skillName]
    };
    setConfig(updatedConfig);

    const rescoredJobs = jobs.map(j => {
      const { score, reason } = Scorer.scoreListing(j, updatedConfig);
      return { ...j, fit_score: score, fit_reason: reason };
    });
    setJobs(rescoredJobs);

    const updatedGaps = GapAnalyzer.analyze(rescoredJobs, updatedConfig);
    setSkillGaps(updatedGaps);
  };

  // Handler: Complete 9-Agent Cycle
  const handleRunCycleComplete = () => {
    const newSampleJobs = IndeedFetcher.fetch(config);
    // Merge new unique jobs
    const existingIds = new Set(jobs.map(j => j.title + j.company));
    const uniqueNew = newSampleJobs.filter(j => !existingIds.has(j.title + j.company));
    const merged = [...uniqueNew, ...jobs];

    // Re-score all
    const scored = merged.map(j => {
      const { score, reason } = Scorer.scoreListing(j, config);
      return { ...j, fit_score: score, fit_reason: reason };
    });
    // Sort by fit score descending
    scored.sort((a, b) => b.fit_score - a.fit_score);

    setJobs(scored);

    // Re-analyze gaps
    const gaps = GapAnalyzer.analyze(scored, config);
    setSkillGaps(gaps);

    // Verify
    Verifier.verify(scored, config);
    setIsCycling(false);
  };

  const handleTriggerCycle = () => {
    setIsCycleModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Navigation Header */}
      <Navbar
        config={config}
        candidate={candidate}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunCycle={handleTriggerCycle}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAddJob={() => setIsAddJobModalOpen(true)}
        isCycling={isCycling}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'jobs' && (
          <TopJobsTab
            jobs={jobs}
            config={config}
            onSelectJobForResume={handleSelectJobForResume}
          />
        )}

        {activeTab === 'gaps' && (
          <SkillGapsTab
            skillGaps={skillGaps}
            config={config}
            candidate={candidate}
            onAddSkillToCandidate={handleAddSkillToCandidate}
          />
        )}

        {activeTab === 'stats' && (
          <StatisticsTab
            jobs={jobs}
            config={config}
            candidate={candidate}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsTab
            skillGaps={skillGaps}
            jobs={jobs}
            config={config}
            candidate={candidate}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'resume' && (
          <ResumeIntelligenceTab
            jobs={jobs}
            candidate={candidate}
            selectedJobId={selectedJobId}
            onSelectJobId={setSelectedJobId}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/60 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>EdgeDash Career Intelligence Platform • 9 Autonomous Agents Active</div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Role: {config.target_role}</span>
            <span>•</span>
            <span>Target: {config.target_city}</span>
            <span>•</span>
            <span>Zero Hallucination Pipeline</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AgentCycleModal
        isOpen={isCycleModalOpen}
        onClose={() => setIsCycleModalOpen(false)}
        onRunComplete={handleRunCycleComplete}
      />

      <CandidateProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        candidate={candidate}
        onSave={(updated) => setCandidate(updated)}
      />

      <AddJobModal
        isOpen={isAddJobModalOpen}
        onClose={() => setIsAddJobModalOpen(false)}
        config={config}
        onAddJob={handleAddJob}
      />
    </div>
  );
}

export default App;
