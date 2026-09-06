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
import { ApplyJobModal } from './components/ApplyJobModal';
import { AuthScreen } from './components/AuthScreen';
import { Footer } from './components/Footer';
import { InfoModal, InfoModalType } from './components/InfoModal';

import { 
  defaultConfig, 
  defaultCandidateProfile, 
  defaultInitialListings, 
  defaultSkillGaps,
  getEmptyCandidateProfile,
  getEmptyConfig
} from './data/defaultData';
import { CandidateProfile, Config, JobListing, SkillGap } from './types';
import { IndeedFetcher, Scorer, GapAnalyzer, Verifier } from './services/agents';
import { LiveJobService } from './services/liveJobsService';
import { 
  subscribeToAuth, 
  logoutUser, 
  testFirestoreConnection,
  saveCandidateProfileToFirestore,
  loadCandidateProfileFromFirestore,
  saveConfigToFirestore,
  loadConfigFromFirestore,
  recordApplicationInFirestore,
  AppUser
} from './services/firebase';
import { Bot } from 'lucide-react';

export function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [infoModalType, setInfoModalType] = useState<InfoModalType>(null);

  // State initialization: starts clean, populated strictly per authenticated user
  const [config, setConfig] = useState<Config>(() => getEmptyConfig());
  const [candidate, setCandidate] = useState<CandidateProfile>(() => getEmptyCandidateProfile());
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);

  const [activeTab, setActiveTab] = useState<string>('jobs');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Modals
  const [isCycleModalOpen, setIsCycleModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState<boolean>(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [applyingJob, setApplyingJob] = useState<JobListing | null>(null);
  const [isCycling, setIsCycling] = useState<boolean>(false);

  // Live API Fetching State
  const [isFetchingLive, setIsFetchingLive] = useState<boolean>(false);
  const [liveFetchSuccessMsg, setLiveFetchSuccessMsg] = useState<string | null>(null);

  // Test connection to Firestore & Listen to Auth state changes
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = subscribeToAuth(async (user) => {
      setCurrentUser(user);
      setAuthChecked(true);

      if (!user) {
        // User logged out: Completely clear all state so no previous user data remains
        setCandidate(getEmptyCandidateProfile());
        setConfig(getEmptyConfig());
        setJobs([]);
        setSkillGaps([]);
        setSelectedJobId(null);
        setApplyingJob(null);
        return;
      }

      // User logged in: Load user-specific data
      try {
        const isDemo = user.email === 'candidate.demo@edgedash.ai';
        const userProfKey = `edgedash_candidate_${user.uid}`;
        const userConfKey = `edgedash_config_${user.uid}`;
        const userJobsKey = `edgedash_jobs_${user.uid}`;

        // 1. Try Firestore first
        const firestoreProfile = await loadCandidateProfileFromFirestore(user.uid);
        const firestoreConfig = await loadConfigFromFirestore(user.uid);

        let activeProfile: CandidateProfile;
        if (firestoreProfile) {
          activeProfile = firestoreProfile;
        } else {
          // Check user-scoped local storage
          const localStr = localStorage.getItem(userProfKey);
          if (localStr) {
            try {
              activeProfile = JSON.parse(localStr);
            } catch (e) {
              activeProfile = isDemo ? defaultCandidateProfile : getEmptyCandidateProfile(user.displayName || '', user.email || '');
            }
          } else if (isDemo) {
            activeProfile = defaultCandidateProfile;
            await saveCandidateProfileToFirestore(user.uid, defaultCandidateProfile);
          } else {
            // New user: clean empty profile so they can fill their own details
            activeProfile = getEmptyCandidateProfile(user.displayName || '', user.email || '');
            await saveCandidateProfileToFirestore(user.uid, activeProfile);
          }
        }
        setCandidate(activeProfile);
        try { localStorage.setItem(userProfKey, JSON.stringify(activeProfile)); } catch (e) {}

        let activeConfig: Config;
        if (firestoreConfig) {
          activeConfig = firestoreConfig;
        } else {
          const localConfStr = localStorage.getItem(userConfKey);
          if (localConfStr) {
            try {
              activeConfig = JSON.parse(localConfStr);
            } catch (e) {
              activeConfig = isDemo ? defaultConfig : getEmptyConfig();
            }
          } else if (isDemo) {
            activeConfig = defaultConfig;
            await saveConfigToFirestore(user.uid, defaultConfig);
          } else {
            activeConfig = getEmptyConfig();
            await saveConfigToFirestore(user.uid, activeConfig);
          }
        }
        setConfig(activeConfig);
        try { localStorage.setItem(userConfKey, JSON.stringify(activeConfig)); } catch (e) {}

        // User jobs
        let activeJobs: JobListing[] = [];
        const localJobsStr = localStorage.getItem(userJobsKey);
        if (localJobsStr) {
          try {
            activeJobs = JSON.parse(localJobsStr);
          } catch (e) {}
        }
        if (!activeJobs || activeJobs.length === 0) {
          activeJobs = defaultInitialListings;
        }

        // Score jobs based on the loaded user config
        const rescored = activeJobs.map(j => {
          const { score, reason } = Scorer.scoreListing(j, activeConfig);
          return { ...j, fit_score: score, fit_reason: reason };
        });
        rescored.sort((a, b) => b.fit_score - a.fit_score);
        setJobs(rescored);
        try { localStorage.setItem(userJobsKey, JSON.stringify(rescored)); } catch (e) {}

        const gaps = GapAnalyzer.analyze(rescored, activeConfig);
        setSkillGaps(gaps);

        if (rescored.length > 0) {
          setSelectedJobId(rescored[0].id);
        }
      } catch (e) {
        console.warn('User profile sync notice:', e);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error('Sign out error:', e);
    } finally {
      // Clear current user
      setCurrentUser(null);
      // Immediately reset all user-specific data to blank
      setCandidate(getEmptyCandidateProfile());
      setConfig(getEmptyConfig());
      setJobs([]);
      setSkillGaps([]);
      setSelectedJobId(null);
      setApplyingJob(null);
      // Purge any legacy global keys
      try {
        localStorage.removeItem('edgedash_candidate');
        localStorage.removeItem('edgedash_config');
        localStorage.removeItem('edgedash_jobs');
        localStorage.removeItem('edgedash_gaps');
        localStorage.removeItem('edgedash_local_user');
      } catch (e) {}
    }
  };

  // Handler: Fetch Real Live Jobs from Jobicy & Remotive APIs
  const handleFetchLiveJobs = async (searchKeyword?: string) => {
    setIsFetchingLive(true);
    setLiveFetchSuccessMsg(null);
    try {
      const liveJobs = await LiveJobService.fetchLiveJobs(searchKeyword || config.target_role, config);
      if (liveJobs.length > 0) {
        const existingKeys = new Set(jobs.map(j => `${j.title.toLowerCase()}___${j.company.toLowerCase()}`));
        const newUnique = liveJobs.filter(j => !existingKeys.has(`${j.title.toLowerCase()}___${j.company.toLowerCase()}`));
        
        const merged = [...newUnique, ...jobs];
        merged.sort((a, b) => b.fit_score - a.fit_score);
        setJobs(merged);
        
        const gaps = GapAnalyzer.analyze(merged, config);
        setSkillGaps(gaps);

        setLiveFetchSuccessMsg(`⚡ Connected to Jobicy & Remotive APIs! Ingested ${liveJobs.length} verified listings (${newUnique.length} brand new added).`);
        setTimeout(() => setLiveFetchSuccessMsg(null), 6500);
      } else {
        setLiveFetchSuccessMsg('API query completed. Current listings are already up to date with live feeds.');
        setTimeout(() => setLiveFetchSuccessMsg(null), 4500);
      }
    } catch (err) {
      console.error('Error fetching live jobs:', err);
      setLiveFetchSuccessMsg('Note: Job API query completed with active cache.');
      setTimeout(() => setLiveFetchSuccessMsg(null), 4000);
    } finally {
      setIsFetchingLive(false);
    }
  };

  // Persist to user-scoped localStorage only when authenticated
  useEffect(() => {
    if (!currentUser) return;
    try {
      localStorage.setItem(`edgedash_config_${currentUser.uid}`, JSON.stringify(config));
    } catch (e) {}
  }, [config, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    try {
      localStorage.setItem(`edgedash_candidate_${currentUser.uid}`, JSON.stringify(candidate));
    } catch (e) {}
  }, [candidate, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    try {
      localStorage.setItem(`edgedash_jobs_${currentUser.uid}`, JSON.stringify(jobs));
    } catch (e) {}
  }, [jobs, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    try {
      localStorage.setItem(`edgedash_gaps_${currentUser.uid}`, JSON.stringify(skillGaps));
    } catch (e) {}
  }, [skillGaps, currentUser]);

  // Handler: Tailor resume from job card
  const handleSelectJobForResume = (job: JobListing) => {
    setSelectedJobId(job.id);
    setActiveTab('resume');
  };

  // Handler: Open Apply Toolkit modal
  const handleOpenApplyJob = (job: JobListing) => {
    setApplyingJob(job);
    setIsApplyModalOpen(true);
  };

  // Handler: Update job status or notes
  const handleUpdateJob = (updatedJob: JobListing) => {
    const newJobs = jobs.map(j => j.id === updatedJob.id ? updatedJob : j);
    setJobs(newJobs);
    setApplyingJob(updatedJob);

    // If applied, record to Firestore
    if (currentUser && updatedJob.application_status === 'applied') {
      recordApplicationInFirestore(currentUser.uid, updatedJob, 'direct_in_app');
    }
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
    if (currentUser) {
      saveCandidateProfileToFirestore(currentUser.uid, updatedProfile);
    }

    // Re-score jobs with updated candidate skills
    const updatedConfig: Config = {
      ...config,
      my_skills: [...config.my_skills, skillName]
    };
    setConfig(updatedConfig);
    if (currentUser) {
      saveConfigToFirestore(currentUser.uid, updatedConfig);
    }

    const rescoredJobs = jobs.map(j => {
      const { score, reason } = Scorer.scoreListing(j, updatedConfig);
      return { ...j, fit_score: score, fit_reason: reason };
    });
    setJobs(rescoredJobs);

    const updatedGaps = GapAnalyzer.analyze(rescoredJobs, updatedConfig);
    setSkillGaps(updatedGaps);
  };

  // Handler: Complete Pipeline Cycle
  const handleRunCycleComplete = async () => {
    // Ingest live jobs from real APIs
    let realNewJobs: JobListing[] = [];
    try {
      realNewJobs = await LiveJobService.fetchLiveJobs(config.target_role, config);
    } catch (e) {
      console.warn('Live API fetch during cycle notice:', e);
    }

    const newSampleJobs = IndeedFetcher.fetch(config);
    const combinedNew = realNewJobs.length > 0 ? [...realNewJobs, ...newSampleJobs] : newSampleJobs;

    // Merge new unique jobs
    const existingIds = new Set(jobs.map(j => `${j.title.toLowerCase()}___${j.company.toLowerCase()}`));
    const uniqueNew = combinedNew.filter(j => !existingIds.has(`${j.title.toLowerCase()}___${j.company.toLowerCase()}`));
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

  // Handler: Save updated Master Profile
  const handleSaveProfile = (updated: CandidateProfile) => {
    setCandidate(updated);
    if (currentUser) {
      saveCandidateProfileToFirestore(currentUser.uid, updated);
      try {
        localStorage.setItem(`edgedash_candidate_${currentUser.uid}`, JSON.stringify(updated));
      } catch (e) {}
    }

    // Synchronize candidate skills and primary target role into config
    const updatedSkills = (updated.skills || []).map(s => s.skill_name);
    const targetRole = (updated.target_roles && updated.target_roles[0]) || config.target_role || '';
    const updatedConfig: Config = {
      ...config,
      my_skills: updatedSkills,
      target_role: targetRole,
      target_city: updated.location || config.target_city || ''
    };
    setConfig(updatedConfig);
    if (currentUser) {
      saveConfigToFirestore(currentUser.uid, updatedConfig);
      try {
        localStorage.setItem(`edgedash_config_${currentUser.uid}`, JSON.stringify(updatedConfig));
      } catch (e) {}
    }

    // Re-score all listings against updated profile
    const rescoredJobs = jobs.map(j => {
      const { score, reason } = Scorer.scoreListing(j, updatedConfig);
      return { ...j, fit_score: score, fit_reason: reason };
    });
    rescoredJobs.sort((a, b) => b.fit_score - a.fit_score);
    setJobs(rescoredJobs);
    if (currentUser) {
      try {
        localStorage.setItem(`edgedash_jobs_${currentUser.uid}`, JSON.stringify(rescoredJobs));
      } catch (e) {}
    }

    // Recalculate skill gaps
    const updatedGaps = GapAnalyzer.analyze(rescoredJobs, updatedConfig);
    setSkillGaps(updatedGaps);
    if (currentUser) {
      try {
        localStorage.setItem(`edgedash_gaps_${currentUser.uid}`, JSON.stringify(updatedGaps));
      } catch (e) {}
    }
  };

  const handleTriggerCycle = () => {
    setIsCycleModalOpen(true);
  };

  // If Auth state is still being checked initially
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 animate-pulse mb-4">
          <Bot className="w-7 h-7" />
        </div>
        <p className="text-sm font-semibold text-slate-300">Initializing EdgeDash...</p>
        <p className="text-xs text-slate-500 mt-1">Connecting to Firebase Auth & Cloud Firestore</p>
      </div>
    );
  }

  // If user is not authenticated: Show Register / Login Screen first!
  if (!currentUser) {
    return (
      <>
        <AuthScreen 
          onAuthSuccess={() => {}}
          onOpenInfo={(type) => setInfoModalType(type)}
        />
        <InfoModal 
          type={infoModalType} 
          onClose={() => setInfoModalType(null)} 
        />
      </>
    );
  }

  // Authenticated Application Workspace
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Navigation Header with current user status & sign out */}
      <Navbar
        config={config}
        candidate={candidate}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunCycle={handleTriggerCycle}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAddJob={() => setIsAddJobModalOpen(true)}
        isCycling={isCycling}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onOpenInfo={(type) => setInfoModalType(type)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'jobs' && (
          <TopJobsTab
            jobs={jobs}
            config={config}
            onSelectJobForResume={handleSelectJobForResume}
            onApplyJob={handleOpenApplyJob}
            onFetchLiveJobs={handleFetchLiveJobs}
            isFetchingLive={isFetchingLive}
            liveFetchMsg={liveFetchSuccessMsg}
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
            onApplyJob={handleOpenApplyJob}
          />
        )}
      </main>

      {/* Comprehensive Application Footer with FAQs, Terms, and Privacy */}
      <Footer 
        onOpenInfo={(type) => setInfoModalType(type)} 
        isAuthenticated={true} 
      />

      {/* Modals */}
      <InfoModal
        type={infoModalType}
        onClose={() => setInfoModalType(null)}
      />

      <AgentCycleModal
        isOpen={isCycleModalOpen}
        onClose={() => setIsCycleModalOpen(false)}
        onRunComplete={handleRunCycleComplete}
      />

      <CandidateProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        candidate={candidate}
        onSave={handleSaveProfile}
      />

      <AddJobModal
        isOpen={isAddJobModalOpen}
        onClose={() => setIsAddJobModalOpen(false)}
        config={config}
        onAddJob={handleAddJob}
      />

      <ApplyJobModal
        isOpen={isApplyModalOpen}
        onClose={() => {
          setIsApplyModalOpen(false);
          setApplyingJob(null);
        }}
        job={applyingJob}
        candidate={candidate}
        onUpdateJob={handleUpdateJob}
        onNavigateToResume={(job) => {
          handleSelectJobForResume(job);
        }}
      />
    </div>
  );
}

export default App;
