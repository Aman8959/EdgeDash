import React, { useState } from 'react';
import { 
  Mic, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Award, 
  HelpCircle, 
  BookOpen, 
  Target, 
  ChevronRight, 
  RefreshCw,
  MessageSquare,
  BarChart,
  Lightbulb,
  Check
} from 'lucide-react';
import { CandidateProfile, JobListing, MockInterviewQuestion } from '../types';

interface InterviewCoachTabProps {
  candidate: CandidateProfile;
  jobs: JobListing[];
  selectedJobId?: string | null;
}

export const InterviewCoachTab: React.FC<InterviewCoachTabProps> = ({
  candidate,
  jobs,
  selectedJobId
}) => {
  const [activeJobId, setActiveJobId] = useState<string>(selectedJobId || (jobs[0]?.id ?? ''));
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Technical' | 'Behavioral' | 'HR' | 'Project' | 'JD-Specific'>('All');
  const [activeQuestionId, setActiveQuestionId] = useState<string>('q1');
  const [candidateAnswer, setCandidateAnswer] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  const selectedJob = jobs.find(j => j.id === activeJobId) || jobs[0];
  const roleTitle = selectedJob?.title || 'Data Analyst';
  const company = selectedJob?.company || 'Leading Enterprise';

  // Questions library tailored to candidate profile and selected job
  const [questions, setQuestions] = useState<MockInterviewQuestion[]>([
    {
      id: 'q1',
      category: 'Technical',
      question: `How would you optimize an analytical SQL query that aggregates millions of transactions to calculate monthly user retention rates?`,
      tips: `Discuss indexing strategies, CTEs vs temporary tables, avoiding SELECT *, and utilizing window functions (e.g., LAG/LEAD, DATE_TRUNC).`,
      ai_evaluation: {
        technical_accuracy: 88,
        communication: 85,
        relevance: 92,
        confidence: 84,
        structure: 86,
        clarity: 87,
        overall_score: 87,
        strengths: [
          'Directly addressed query partitioning and indexing',
          'Mentioned practical use of window functions'
        ],
        improvements: [
          'Can mention EXPLAIN query execution plan to inspect bottleneck',
          'Quantify database performance metrics'
        ],
        model_answer: `To optimize retention queries over large datasets: First, filter partitions early using date ranges and ensure indexed foreign keys on user_id and timestamp. Second, use window functions like LAG() over user cohorts instead of costly self-joins. Third, leverage CTEs or materialized views for intermediate aggregate tables to avoid recalculating base scans.`
      }
    },
    {
      id: 'q2',
      category: 'Project',
      question: `Walk me through your "${candidate.projects[0]?.name || 'Data Intelligence'}" project. What was the architecture and how did you measure success?`,
      tips: `Structure using the STAR framework: Situation -> Task -> Action (tools used: ${candidate.projects[0]?.skills_used?.slice(0, 3).join(', ') || 'Python, SQL'}) -> Measurable Result.`,
      ai_evaluation: undefined
    },
    {
      id: 'q3',
      category: 'Behavioral',
      question: `Describe a situation where stakeholders had conflicting requirements for an analytics dashboard. How did you handle it?`,
      tips: `Demonstrate cross-functional communication, empathetic listening, prioritizing core business KPIs, and iterative MVP releases.`,
      ai_evaluation: undefined
    },
    {
      id: 'q4',
      category: 'JD-Specific',
      question: `At ${company}, data quality is critical for automated decision systems. How do you prevent and validate anomalous data ingestion in your pipelines?`,
      tips: `Discuss schema validation, anomaly detection rules (Z-score, Great Expectations), error handling alerts, and automated rollback strategies.`,
      ai_evaluation: undefined
    },
    {
      id: 'q5',
      category: 'HR',
      question: `What motivated you to apply for the ${roleTitle} role at ${company}, and where do you see your career progression over the next 2-3 years?`,
      tips: `Connect your passion for technical excellence and data scaling with ${company}'s domain. Emphasize continuous skill expansion and leadership ambitions.`,
      ai_evaluation: undefined
    }
  ]);

  const activeQuestion = questions.find(q => q.id === activeQuestionId) || questions[0];

  const filteredQuestions = selectedCategory === 'All' 
    ? questions 
    : questions.filter(q => q.category === selectedCategory);

  const handleEvaluateAnswer = () => {
    if (!candidateAnswer.trim()) return;
    setIsEvaluating(true);

    setTimeout(() => {
      // Intelligent mock evaluation based on length and keywords
      const words = candidateAnswer.trim().split(/\s+/).length;
      const accuracy = Math.min(95, Math.max(65, 75 + Math.round(words / 15)));
      const communication = Math.min(92, Math.max(70, 78 + Math.round(words / 20)));
      const clarity = 88;
      const overall = Math.round((accuracy * 0.4) + (communication * 0.3) + (clarity * 0.3));

      const updatedQuestions = questions.map(q => {
        if (q.id === activeQuestionId) {
          return {
            ...q,
            candidate_answer: candidateAnswer,
            ai_evaluation: {
              technical_accuracy: accuracy,
              communication: communication,
              relevance: 90,
              confidence: 84,
              structure: 86,
              clarity: clarity,
              overall_score: overall,
              strengths: [
                'Clear logical delivery with concise terminology',
                'Good relevance to the target analytical domain'
              ],
              improvements: [
                'Incorporate more quantitative business metrics',
                'Tie explanation directly to stakeholder business impact'
              ],
              model_answer: q.tips
            }
          };
        }
        return q;
      });

      setQuestions(updatedQuestions);
      setIsEvaluating(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🎙️ AI Interview Coach & Mock Simulator</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-medium">
              STAR Method & Evaluation
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Simulate realistic technical and behavioral interviews tailored to your target company and job description.
          </p>
        </div>

        {/* Job selector */}
        <div className="w-full md:w-72">
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">
            Practice for Target Job:
          </label>
          <select
            value={activeJobId}
            onChange={(e) => setActiveJobId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            {jobs.map(j => (
              <option key={j.id} value={j.id}>
                {j.title} • {j.company}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Left Question Explorer, Right Mock Answering Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Questions List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-1.5 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
            {['All', 'Technical', 'Behavioral', 'Project', 'JD-Specific', 'HR'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  selectedCategory === cat 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Question Cards */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredQuestions.map((q, idx) => {
              const isActive = q.id === activeQuestionId;
              const hasScore = !!q.ai_evaluation;

              return (
                <div
                  key={q.id}
                  onClick={() => {
                    setActiveQuestionId(q.id);
                    setCandidateAnswer(q.candidate_answer || '');
                  }}
                  className={`p-3.5 rounded-xl border transition cursor-pointer text-left ${
                    isActive 
                      ? 'bg-blue-950/40 border-blue-500 text-white shadow-md' 
                      : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-slate-300">
                      {q.category}
                    </span>
                    {hasScore && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                        Score: {q.ai_evaluation?.overall_score}%
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-medium line-clamp-2">
                    {q.question}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Question & Interactive Answering Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Question Presentation Card */}
          <div className="bg-slate-800/50 border border-slate-700/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                {activeQuestion.category} Question
              </span>
              <span className="text-xs text-slate-400">
                Targeting: <strong className="text-white">{roleTitle}</strong> at <strong className="text-white">{company}</strong>
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
              {activeQuestion.question}
            </h3>

            {/* Answer strategy tips */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-amber-300">Answer Strategy Tip:</strong> {activeQuestion.tips}
              </div>
            </div>
          </div>

          {/* Candidate Practice Answering Box */}
          <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Your Answer (Practice Writing or Speaking):
              </label>
              <span className="text-xs text-slate-500">
                {candidateAnswer.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            <textarea
              rows={6}
              value={candidateAnswer}
              onChange={(e) => setCandidateAnswer(e.target.value)}
              placeholder="Type your structured answer here (using Situation, Task, Action, Result)..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl p-4 text-xs sm:text-sm text-slate-200 focus:outline-none leading-relaxed placeholder-slate-600"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-xs text-slate-500">
                Pro-tip: Include technical keywords and measurable outcomes from your projects.
              </p>

              <button
                onClick={handleEvaluateAnswer}
                disabled={isEvaluating || !candidateAnswer.trim()}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition shadow-md shadow-blue-600/30 disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isEvaluating ? 'animate-spin' : ''}`} />
                <span>{isEvaluating ? 'Evaluating with AI...' : 'Submit Answer for AI Evaluation'}</span>
              </button>
            </div>
          </div>

          {/* AI Feedback & Scoring Report */}
          {activeQuestion.ai_evaluation && (
            <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">AI Evaluation & Scoring Report</h4>
                    <span className="text-xs text-slate-400">Evaluated against enterprise interview rubrics</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-emerald-400">
                    {activeQuestion.ai_evaluation.overall_score}/100
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300">
                    {activeQuestion.ai_evaluation.overall_score >= 85 ? 'Strong Pass' : 'Good Base'}
                  </span>
                </div>
              </div>

              {/* Rubric Breakdown Meters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400">Technical Accuracy</div>
                  <div className="text-lg font-bold text-blue-400 mt-0.5">{activeQuestion.ai_evaluation.technical_accuracy}%</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400">Communication</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">{activeQuestion.ai_evaluation.communication}%</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400">Structure (STAR)</div>
                  <div className="text-lg font-bold text-purple-400 mt-0.5">{activeQuestion.ai_evaluation.structure}%</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                  <div className="text-[11px] text-slate-400">Clarity & Brevity</div>
                  <div className="text-lg font-bold text-amber-400 mt-0.5">{activeQuestion.ai_evaluation.clarity}%</div>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-emerald-950/20 border border-emerald-800/40 p-3 rounded-lg space-y-1.5">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Key Strengths
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {activeQuestion.ai_evaluation.strengths.map((s, idx) => (
                      <li key={idx}>• {s}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-950/20 border border-amber-800/40 p-3 rounded-lg space-y-1.5">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5" /> Recommended Improvements
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {activeQuestion.ai_evaluation.improvements.map((imp, idx) => (
                      <li key={idx}>• {imp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Exemplar Model Answer */}
              {activeQuestion.ai_evaluation.model_answer && (
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    Exemplar High-Scoring Response Reference:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{activeQuestion.ai_evaluation.model_answer}"
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
