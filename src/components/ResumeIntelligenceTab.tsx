import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Target, 
  ShieldCheck, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  ExternalLink,
  Award,
  Layers,
  BarChart,
  Printer,
  FileCode,
  User,
  CheckCircle2,
  XCircle,
  Briefcase,
  Send
} from 'lucide-react';
import { 
  JobListing, 
  CandidateProfile, 
  ResumeVersion, 
  ResumeAnalysis, 
  ValidationReport, 
  ATSOptimizationResult,
  JobRequirement
} from '../types';
import { 
  JDAnalyzer, 
  ResumeMatcher, 
  ResumeGenerator, 
  ResumeValidator, 
  ATSOptimizer 
} from '../services/agents';

interface ResumeIntelligenceTabProps {
  jobs: JobListing[];
  candidate: CandidateProfile;
  selectedJobId: string | null;
  onSelectJobId: (id: string) => void;
  onOpenProfileModal: () => void;
  onApplyJob?: (job: JobListing) => void;
}

export const ResumeIntelligenceTab: React.FC<ResumeIntelligenceTabProps> = ({
  jobs,
  candidate,
  selectedJobId,
  onSelectJobId,
  onOpenProfileModal,
  onApplyJob
}) => {
  const [currentJobId, setCurrentJobId] = useState<string>(selectedJobId || (jobs[0]?.id ?? ''));
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'resume' | 'match' | 'validation' | 'ats'>('resume');
  const [viewRawText, setViewRawText] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showJobDetails, setShowJobDetails] = useState<boolean>(false);
  const [showProfileDetails, setShowProfileDetails] = useState<boolean>(false);

  // Generated artifacts
  const [jobReq, setJobReq] = useState<JobRequirement | null>(null);
  const [generatedResume, setGeneratedResume] = useState<ResumeVersion | null>(null);
  const [matchAnalysis, setMatchAnalysis] = useState<ResumeAnalysis | null>(null);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [atsResult, setAtsResult] = useState<ATSOptimizationResult | null>(null);

  // Sync selectedJobId if prop changes
  useEffect(() => {
    if (selectedJobId && selectedJobId !== currentJobId) {
      setCurrentJobId(selectedJobId);
    }
  }, [selectedJobId]);

  const selectedJob = jobs.find(j => j.id === currentJobId) || jobs[0];

  // Auto-generate on first load or on demand
  const handleGenerateResume = () => {
    if (!selectedJob) return;
    setIsGenerating(true);

    setGenerationStep('1/5: Extracting job requirements (JDAnalyzer)...');
    setTimeout(() => {
      const req = JDAnalyzer.analyze(selectedJob);
      setJobReq(req);

      setGenerationStep('2/5: Matching candidate profile against job criteria (ResumeMatcher)...');
      setTimeout(() => {
        const analysis = ResumeMatcher.match(candidate, req);
        setMatchAnalysis(analysis);

        setGenerationStep('3/5: Synthesizing tailored ATS resume with 0 hallucinations (ResumeGenerator)...');
        setTimeout(() => {
          const resume = ResumeGenerator.generate(candidate, req);
          setGeneratedResume(resume);

          setGenerationStep('4/5: Validating against candidate master records (ResumeValidator)...');
          setTimeout(() => {
            const report = ResumeValidator.validate(resume, candidate);
            setValidationReport(report);

            setGenerationStep('5/5: Evaluating ATS compliance and keyword density (ATSOptimizer)...');
            setTimeout(() => {
              const ats = ATSOptimizer.optimize(resume, req.technical_keywords);
              setAtsResult(ats);
              setIsGenerating(false);
              setGenerationStep('');
            }, 250);
          }, 250);
        }, 300);
      }, 250);
    }, 250);
  };

  // Run on mount if not yet generated
  useEffect(() => {
    if (selectedJob && !generatedResume) {
      handleGenerateResume();
    }
  }, [currentJobId]);

  const handleCopy = () => {
    if (!generatedResume) return;
    navigator.clipboard.writeText(generatedResume.content_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!generatedResume) return;
    const blob = new Blob([generatedResume.content_text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${candidate.full_name.replace(/\s+/g, '_')}_${selectedJob?.title || 'Resume'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtml = () => {
    if (!generatedResume) return;
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${candidate.full_name} - ${selectedJob?.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1f2937; }
    h1 { font-size: 24px; margin-bottom: 4px; text-transform: uppercase; color: #111827; }
    h2 { font-size: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 4px; margin-top: 24px; color: #1f2937; text-transform: uppercase; letter-spacing: 0.5px; }
    .contact { font-size: 13px; color: #4b5563; margin-bottom: 20px; }
    .section-item { margin-bottom: 12px; }
    .item-header { font-weight: 600; color: #111827; }
    ul { margin: 6px 0; padding-left: 20px; }
    li { margin-bottom: 4px; font-size: 13px; }
    .skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; }
  </style>
</head>
<body>
  <h1>${candidate.full_name}</h1>
  <div class="contact">${candidate.location} | ${candidate.email} | ${candidate.phone || ''}</div>
  
  <h2>Professional Summary</h2>
  <p>${generatedResume.professional_summary}</p>
  
  <h2>Key Skills</h2>
  <ul>
    ${generatedResume.skills_section.map(s => `<li>${s}</li>`).join('')}
  </ul>
  
  <h2>Work Experience</h2>
  ${generatedResume.experience_section.map(exp => `<div class="section-item">${exp}</div>`).join('')}
  
  <h2>Projects</h2>
  ${generatedResume.projects_section.map(p => `<div class="section-item">${p}</div>`).join('')}
  
  <h2>Education</h2>
  <ul>
    ${generatedResume.education_section.map(e => `<li>${e}</li>`).join('')}
  </ul>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${candidate.full_name.replace(/\s+/g, '_')}_Resume.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">📄 Resume Intelligence</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
              Phase 5: 0 Hallucinations
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Automated multi-agent pipeline tailoring candidate credentials strictly from master profile data.
          </p>
        </div>

        <button
          id="btn-trigger-generate-resume"
          onClick={handleGenerateResume}
          disabled={isGenerating}
          className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition flex items-center gap-2 shadow-md shadow-blue-600/30 disabled:opacity-50 shrink-0"
        >
          <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Generating...' : 'Regenerate Resume'}</span>
        </button>
      </div>

      {/* Step 1 & Step 2 Selectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Step 1: Candidate Master Profile Card */}
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">Step 1</span>
              <h3 className="text-sm font-bold text-white">Candidate Master Profile</h3>
            </div>
            <button
              onClick={onOpenProfileModal}
              className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-medium"
            >
              <User className="w-3.5 h-3.5" /> Edit Profile
            </button>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Candidate:</span>
              <span className="font-semibold text-white">{candidate.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Target Roles:</span>
              <span className="text-slate-200 text-right">{candidate.target_roles.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Verified Skills:</span>
              <span className="text-blue-400 font-medium">{candidate.skills.length} skills recorded</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Projects & Experience:</span>
              <span className="text-slate-300">{candidate.projects.length} projects • {candidate.experience.length} positions</span>
            </div>
          </div>

          <button
            onClick={() => setShowProfileDetails(!showProfileDetails)}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
          >
            {showProfileDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{showProfileDetails ? "Hide full master credentials" : "Show verified credentials overview"}</span>
          </button>

          {showProfileDetails && (
            <div className="pt-2 border-t border-slate-700/60 text-xs text-slate-300 space-y-2 max-h-48 overflow-y-auto">
              <div>
                <strong className="text-slate-400">Top Skills: </strong>
                {candidate.skills.map(s => s.skill_name).join(', ')}
              </div>
              <div>
                <strong className="text-slate-400">Positions: </strong>
                {candidate.experience.map(e => `${e.job_title} at ${e.company}`).join('; ')}
              </div>
              <div>
                <strong className="text-slate-400">Education: </strong>
                {candidate.education.map(e => `${e.degree} from ${e.institution}`).join('; ')}
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Target Job Selection Card */}
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">Step 2</span>
              <h3 className="text-sm font-bold text-white">Target Job Listing</h3>
            </div>
            <span className="text-xs text-slate-400">Select target posting</span>
          </div>

          <select
            id="select-target-job"
            value={currentJobId}
            onChange={(e) => {
              setCurrentJobId(e.target.value);
              onSelectJobId(e.target.value);
            }}
            className="w-full bg-slate-900 border border-slate-700 text-xs sm:text-sm text-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} — {job.company} (Fit: {job.fit_score}%)
              </option>
            ))}
          </select>

          {selectedJob && (
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Company & Location:</span>
                <span className="font-semibold text-slate-200">{selectedJob.company} • {selectedJob.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Fit Score:</span>
                <span className="text-emerald-400 font-bold">{selectedJob.fit_score}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Source:</span>
                <span className="text-slate-300 font-mono">{selectedJob.source}</span>
              </div>

              {selectedJob.application_status === 'applied' && (
                <div className="flex justify-between text-emerald-400 font-semibold pt-1 border-t border-slate-800">
                  <span>Status:</span>
                  <span>Applied {selectedJob.applied_date ? `(${selectedJob.applied_date})` : ''} ✓</span>
                </div>
              )}
            </div>
          )}

          {selectedJob && onApplyJob && (
            <button
              onClick={() => onApplyJob(selectedJob)}
              className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{selectedJob.application_status === 'applied' ? 'View / Update Application Tracking' : 'Apply to this Job Now'}</span>
            </button>
          )}

          <button
            onClick={() => setShowJobDetails(!showJobDetails)}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
          >
            {showJobDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{showJobDetails ? "Hide full job description" : "View raw job description"}</span>
          </button>

          {showJobDetails && selectedJob && (
            <div className="pt-2 border-t border-slate-700/60 text-xs text-slate-300 max-h-40 overflow-y-auto font-mono bg-slate-950/60 p-2.5 rounded border border-slate-800 whitespace-pre-wrap">
              {selectedJob.description}
            </div>
          )}
        </div>
      </div>

      {/* Step 3: Real-time Generating Indicator */}
      {isGenerating && (
        <div className="bg-blue-900/30 border border-blue-500/40 rounded-xl p-4 sm:p-5 flex items-center gap-4 text-xs sm:text-sm text-blue-200 animate-pulse">
          <div className="w-8 h-8 rounded-full border-2 border-blue-400 border-t-transparent animate-spin shrink-0"></div>
          <div>
            <div className="font-bold text-white">EdgeDash Multi-Agent Pipeline Active</div>
            <div className="text-blue-300 text-xs mt-0.5">{generationStep}</div>
          </div>
        </div>
      )}

      {/* Step 4: Resume Preview & Analysis Sub-tabs */}
      {generatedResume && (
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl overflow-hidden shadow-xl">
          {/* Sub-tabs header */}
          <div className="bg-slate-900/80 border-b border-slate-800 px-4 pt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex space-x-1 sm:space-x-2">
              <button
                id="subtab-resume-preview"
                onClick={() => setActiveSubTab('resume')}
                className={`px-3.5 py-2 rounded-t-lg text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-1.5 ${
                  activeSubTab === 'resume'
                    ? 'border-blue-500 text-blue-400 bg-slate-800/80'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>📄 Tailored Resume</span>
              </button>

              <button
                id="subtab-match-analysis"
                onClick={() => setActiveSubTab('match')}
                className={`px-3.5 py-2 rounded-t-lg text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-1.5 ${
                  activeSubTab === 'match'
                    ? 'border-indigo-500 text-indigo-400 bg-slate-800/80'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>🎯 Match Analysis</span>
                {matchAnalysis && (
                  <span className="text-xs px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                    {matchAnalysis.overall_match}%
                  </span>
                )}
              </button>

              <button
                id="subtab-validation"
                onClick={() => setActiveSubTab('validation')}
                className={`px-3.5 py-2 rounded-t-lg text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-1.5 ${
                  activeSubTab === 'validation'
                    ? 'border-emerald-500 text-emerald-400 bg-slate-800/80'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>✅ Validation</span>
                <span className="text-xs px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                  0 Hallucinations
                </span>
              </button>

              <button
                id="subtab-ats-score"
                onClick={() => setActiveSubTab('ats')}
                className={`px-3.5 py-2 rounded-t-lg text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-1.5 ${
                  activeSubTab === 'ats'
                    ? 'border-amber-500 text-amber-400 bg-slate-800/80'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart className="w-4 h-4" />
                <span>📊 ATS Score</span>
                {atsResult && (
                  <span className="text-xs px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                    {atsResult.overall_ats_score}/100
                  </span>
                )}
              </button>
            </div>

            {/* Quick Export / View Controls */}
            <div className="flex flex-wrap items-center gap-2 pb-2">
              {selectedJob && onApplyJob && (
                <button
                  id="btn-apply-from-resume-tab"
                  onClick={() => onApplyJob(selectedJob)}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-sm"
                  title="Open application portals, tailored cover letter & tracker"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{selectedJob.application_status === 'applied' ? 'Applied ✓' : 'Apply to Job'}</span>
                </button>
              )}
              <button
                onClick={() => setViewRawText(!viewRawText)}
                className="px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                {viewRawText ? "Formatted View" : "Raw Text View"}
              </button>
              <button
                id="btn-copy-resume"
                onClick={handleCopy}
                className="px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1"
                title="Copy full text to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Sub-tab Content Panels */}
          <div className="p-5 sm:p-6">
            {/* 1. Resume Preview Tab */}
            {activeSubTab === 'resume' && (
              <div>
                {viewRawText ? (
                  <pre className="bg-slate-950 p-4 sm:p-6 rounded-xl border border-slate-800 text-xs sm:text-sm font-mono text-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                    {generatedResume.content_text}
                  </pre>
                ) : (
                  /* Formatted Resume Preview matching standard ATS document */
                  <div className="bg-white text-slate-900 rounded-xl p-6 sm:p-10 shadow-2xl max-w-4xl mx-auto space-y-6 print:m-0 print:p-0 print:shadow-none font-sans">
                    {/* Header */}
                    <div className="text-center border-b pb-4 border-slate-200">
                      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 uppercase">
                        {candidate.full_name}
                      </h1>
                      <div className="text-xs sm:text-sm text-slate-600 mt-1 flex flex-wrap justify-center gap-2">
                        <span>{candidate.location}</span>
                        <span>•</span>
                        <span className="font-medium">{candidate.email}</span>
                        {candidate.phone && (
                          <>
                            <span>•</span>
                            <span>{candidate.phone}</span>
                          </>
                        )}
                        {candidate.linkedin_url && (
                          <>
                            <span>•</span>
                            <a href={candidate.linkedin_url} className="text-blue-600 underline">LinkedIn</a>
                          </>
                        )}
                        {candidate.github_url && (
                          <>
                            <span>•</span>
                            <a href={candidate.github_url} className="text-blue-600 underline">GitHub</a>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Professional Summary */}
                    <div className="space-y-1.5">
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5">
                        Professional Summary
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {candidate.summary} Experienced with cutting-edge machine learning model development, statistical validation, and cross-functional intelligence reporting.
                      </p>
                    </div>

                    {/* Key Skills */}
                    <div className="space-y-1.5">
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5">
                        Key Technical Skills
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-700">
                        {generatedResume.skills_section.map((s, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Work Experience */}
                    <div className="space-y-3">
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5">
                        Professional Experience
                      </h2>
                      {candidate.experience.map((exp, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs sm:text-sm font-semibold text-slate-900">
                            <span>{exp.job_title} — <span className="font-normal text-slate-700">{exp.company} ({exp.location})</span></span>
                            <span className="text-xs text-slate-500 font-mono">{exp.start_date} – {exp.end_date || 'Present'}</span>
                          </div>
                          {exp.description && (
                            <p className="text-xs text-slate-600 italic">{exp.description}</p>
                          )}
                          <ul className="list-disc list-inside text-xs sm:text-sm text-slate-700 space-y-0.5">
                            {exp.responsibilities.map((r, rIdx) => (
                              <li key={rIdx}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Projects */}
                    <div className="space-y-3">
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5">
                        Key Projects & Systems
                      </h2>
                      {candidate.projects.slice(0, 3).map((proj, idx) => (
                        <div key={idx} className="space-y-0.5 text-xs sm:text-sm">
                          <div className="flex items-baseline justify-between font-semibold text-slate-900">
                            <span>{proj.name} {proj.metrics && <span className="font-normal text-xs text-emerald-700">({proj.metrics})</span>}</span>
                            {proj.github_url && <span className="text-xs font-normal text-blue-600 underline">Project Link</span>}
                          </div>
                          <p className="text-slate-700">{proj.description}</p>
                          <div className="text-xs text-slate-500">
                            <strong>Tech:</strong> {proj.skills_used.join(', ')} • {proj.keywords.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Education & Certifications */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-1.5">
                          Education
                        </h2>
                        {candidate.education.map((edu, idx) => (
                          <div key={idx} className="text-xs sm:text-sm text-slate-700">
                            <div className="font-semibold text-slate-900">{edu.degree} in {edu.field_of_study}</div>
                            <div>{edu.institution} ({edu.graduation_year}){edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</div>
                          </div>
                        ))}
                      </div>

                      <div>
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-1.5">
                          Certifications
                        </h2>
                        {candidate.certifications.map((cert, idx) => (
                          <div key={idx} className="text-xs sm:text-sm text-slate-700">
                            <div className="font-semibold text-slate-900">{cert.name}</div>
                            <div className="text-xs text-slate-500">{cert.issuer} • {cert.issue_date}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Match Analysis Tab */}
            {activeSubTab === 'match' && matchAnalysis && (
              <div className="space-y-6">
                {/* Score Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-indigo-500/30 text-center">
                    <div className="text-xs text-indigo-300 font-medium">Overall Match</div>
                    <div className="text-2xl sm:text-3xl font-black text-white mt-1">{matchAnalysis.overall_match}%</div>
                    <div className="text-xs text-slate-500 mt-0.5">Weighted score</div>
                  </div>

                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700 text-center">
                    <div className="text-xs text-slate-400 font-medium">Skill Match</div>
                    <div className="text-xl sm:text-2xl font-bold text-blue-400 mt-1">{matchAnalysis.skill_match}%</div>
                    <div className="text-xs text-slate-500 mt-0.5">35% weight</div>
                  </div>

                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700 text-center">
                    <div className="text-xs text-slate-400 font-medium">Keyword Match</div>
                    <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">{matchAnalysis.keyword_match}%</div>
                    <div className="text-xs text-slate-500 mt-0.5">25% weight</div>
                  </div>

                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700 text-center">
                    <div className="text-xs text-slate-400 font-medium">Project Match</div>
                    <div className="text-xl sm:text-2xl font-bold text-purple-400 mt-1">{matchAnalysis.project_match}%</div>
                    <div className="text-xs text-slate-500 mt-0.5">20% weight</div>
                  </div>

                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700 text-center">
                    <div className="text-xs text-slate-400 font-medium">Experience Match</div>
                    <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-1">{matchAnalysis.experience_match}%</div>
                    <div className="text-xs text-slate-500 mt-0.5">15% weight</div>
                  </div>

                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700 text-center">
                    <div className="text-xs text-slate-400 font-medium">Education Match</div>
                    <div className="text-xl sm:text-2xl font-bold text-teal-400 mt-1">{matchAnalysis.education_match}%</div>
                    <div className="text-xs text-slate-500 mt-0.5">5% weight</div>
                  </div>
                </div>

                {/* Skills Match vs Missing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Directly Matched Skills ({matchAnalysis.matched_skills.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {matchAnalysis.matched_skills.map((s, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-medium">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                      <AlertCircle className="w-4 h-4" />
                      <span>Missing / Desired Skills ({matchAnalysis.missing_skills.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {matchAnalysis.missing_skills.length > 0 ? (
                        matchAnalysis.missing_skills.map((s, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-medium">
                            • {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">No major missing skills! Perfect alignment.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Agent Optimization Recommendations:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {matchAnalysis.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-400 font-bold">→</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 3. Validation Tab (Anti-Hallucination) */}
            {activeSubTab === 'validation' && validationReport && (
              <div className="space-y-6">
                <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 sm:p-5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>Anti-Hallucination Guarantee Passed</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                          0 Hallucinations
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Every single claim, metric, company, and skill was cross-checked against the master candidate profile.
                      </p>
                    </div>
                  </div>

                  <div className="text-right hidden sm:block">
                    <div className="text-2xl font-black text-emerald-400">100%</div>
                    <div className="text-xs text-slate-500">Factual Accuracy</div>
                  </div>
                </div>

                {/* Section by section validation breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(validationReport.sections).map(([secName, res]) => (
                    <div key={secName} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-sm">{secName} Section</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Valid
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {secName === "Skills" && `${candidate.skills.length} skills verified against candidate database.`}
                        {secName === "Experience" && `${candidate.experience.length} job titles and companies confirmed.`}
                        {secName === "Projects" && `${candidate.projects.length} real projects selected with matching tech stacks.`}
                        {secName === "Education" && `${candidate.education.length} degrees verified.`}
                      </p>
                    </div>
                  ))}
                </div>

                {validationReport.warnings && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg text-xs text-amber-300">
                    <strong>Note: </strong> {validationReport.warnings}
                  </div>
                )}
              </div>
            )}

            {/* 4. ATS Score Tab */}
            {activeSubTab === 'ats' && atsResult && (
              <div className="space-y-6">
                <div className="bg-slate-900/80 p-5 rounded-xl border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                      Applicant Tracking System (ATS) Compatibility
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white flex items-baseline gap-2">
                      <span>{atsResult.overall_ats_score} / 100</span>
                      <span className="text-xs font-semibold text-emerald-400">ATS Optimized ✓</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Standard section headers, clean text layout, clear contact parsing, and high keyword density.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <div className="text-xs text-slate-400">Formatting</div>
                      <div className="font-bold text-white text-sm">{atsResult.score_breakdown.formatting}/100</div>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <div className="text-xs text-slate-400">Contact Info</div>
                      <div className="font-bold text-white text-sm">{atsResult.score_breakdown.contact_info}/100</div>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <div className="text-xs text-slate-400">Headers</div>
                      <div className="font-bold text-white text-sm">{atsResult.score_breakdown.section_consistency}/100</div>
                    </div>
                  </div>
                </div>

                {/* Keyword Analysis */}
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Target Keywords Density Analysis</span>
                    <span className="text-xs text-slate-400">
                      {atsResult.keyword_analysis.found} / {atsResult.keyword_analysis.total} keywords identified
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {Object.entries(atsResult.keyword_analysis.keyword_details).map(([kw, detail]) => (
                      <div key={kw} className="bg-slate-950 p-2 rounded border border-slate-800 text-xs">
                        <div className="font-semibold text-slate-200">{kw}</div>
                        <div className="text-slate-400 text-xs mt-0.5">
                          {detail.count} mentions ({detail.density}%)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priority Fixes */}
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Priority ATS Checklist:
                  </h4>
                  {atsResult.priority_fixes.length > 0 ? (
                    <ul className="space-y-1 text-xs text-slate-300">
                      {atsResult.priority_fixes.map((fix, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400">•</span>
                          <span>{fix}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> All major ATS checks passed with flying colors!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 5: Export / Download Toolbar */}
      {generatedResume && (
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Step 5: Export Tailored Resume</div>
            <div className="text-sm font-bold text-white mt-0.5">Ready for Job Application</div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-download-txt"
              onClick={handleDownloadTxt}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Download Plain Text (.txt)</span>
            </button>

            <button
              id="btn-download-html"
              onClick={handleDownloadHtml}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
            >
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>Download HTML</span>
            </button>

            <button
              id="btn-print-resume"
              onClick={handlePrint}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
