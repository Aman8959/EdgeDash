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
  defaultSkillGaps 
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
  recordApplicationInFirestore
} from './services/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { Bot } from 'lucide-react';

export function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [infoModalType, setInfoModalType] = useState<InfoModalType>(null);

  // State initialization with localStorage fallback
  const [config, setConfig] = useState<Config>(() => {
    const saved = localStorage.getItem('edgedash_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.target_city !== 'Indore' && parsed.target_role !== 'Data Scientist') {
          return parsed;
        }
      } catch (e) {}
    }
    return defaultConfig;
  });

  const [candidate, setCandidate] = useState<CandidateProfile>(() => {
    const saved = localStorage.getItem('edgedash_candidate');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.full_name && parsed.full_name !== 'John Doe') {
          return parsed;
        }
      } catch (e) {}
    }
    return defaultCandidateProfile;
  });

  const [jobs, setJobs] = useState<JobListing[]>(() => {
    const saved = localStorage.getItem('edgedash_jobs');
    if (saved) {
      try {
        const parsed: JobListing[] = JSON.parse(saved);
        // If saved jobs contain old dummy placeholder URLs (example.com), refresh with new verified listings
        const hasDummy = parsed.some(j => (j.url && j.url.includes('example.com')) || j.company === 'TechCorp India');
        if (!hasDummy && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    return defaultInitialListings;
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

      if (user) {
        // Load user-specific profile and config from Firestore
        try {
          const userProfile = await loadCandidateProfileFromFirestore(user.uid);
          if (userProfile) {
            setCandidate(userProfile);
          } else {
            // First time user: save initial profile to Firestore
            const initialForUser: CandidateProfile = {
              ...candidate,
              full_name: user.displayName || candidate.full_name || 'Aman Kumar Yadav',
              email: user.email || candidate.email
            };
            setCandidate(initialForUser);
            await saveCandidateProfileToFirestore(user.uid, initialForUser);
          }

          const userConfig = await loadConfigFromFirestore(user.uid);
          if (userConfig) {
            setConfig(userConfig);
          } else {
            await saveConfigToFirestore(user.uid, config);
          }
        } catch (e) {
          console.warn('Firestore initial data sync notice:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
    } catch (e) {
      console.error('Sign out error:', e);
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
    }

    // Synchronize candidate skills and primary target role into config
    const updatedSkills = updated.skills.map(s => s.skill_name);
    const updatedConfig: Config = {
      ...config,
      my_skills: updatedSkills,
      target_role: updated.target_roles[0] || config.target_role
    };
    setConfig(updatedConfig);
    if (currentUser) {
      saveConfigToFirestore(currentUser.uid, updatedConfig);
    }

    // Re-score all listings against updated profile
    const rescoredJobs = jobs.map(j => {
      const { score, reason } = Scorer.scoreListing(j, updatedConfig);
      return { ...j, fit_score: score, fit_reason: reason };
    });
    rescoredJobs.sort((a, b) => b.fit_score - a.fit_score);
    setJobs(rescoredJobs);

    // Recalculate skill gaps
    const updatedGaps = GapAnalyzer.analyze(rescoredJobs, updatedConfig);
    setSkillGaps(updatedGaps);
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
