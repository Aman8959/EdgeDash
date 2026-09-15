export interface Skill {
  skill_name: string;
  proficiency: 'Expert' | 'Advanced' | 'Intermediate' | 'Beginner';
  years_of_experience: number;
  category: string;
  endorsements?: number;
  verified?: boolean;
}

export interface Experience {
  company: string;
  job_title: string;
  start_date: string;
  end_date: string | null;
  description: string;
  location: string;
  responsibilities: string[];
  skills_demonstrated: string[];
  skills_used?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field_of_study: string;
  graduation_year: number | string;
  gpa?: string;
  relevant_coursework?: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date: string | null;
  credential_url?: string;
}

export interface Project {
  name: string;
  description: string;
  category: string;
  target_roles: string[];
  skills_used: string[];
  keywords: string[];
  priority: number;
  url?: string;
  github_url?: string | null;
  metrics?: string;
}

export interface CandidateProfile {
  id?: number;
  full_name: string;
  email: string;
  phone?: string;
  location: string;
  summary: string;
  target_roles: string[];
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  projects: Project[];
  achievements: string[];
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  source: string;
  posted_at: string;
  fetched_at: string;
  fit_score: number;
  fit_reason?: string;
  application_status?: 'not_applied' | 'applied' | 'interviewing' | 'offered' | 'rejected';
  applied_date?: string;
  application_notes?: string;
  application_ref?: string;
  applied_channel?: 'in_app_direct' | 'email_direct' | 'external_portal';
}

export interface SkillGap {
  skill: string;
  frequency: number;
  last_seen?: string;
}

export interface JobRequirement {
  job_id: string;
  job_title: string;
  seniority: string;
  required_skills: string[];
  preferred_skills: string[];
  technical_keywords: string[];
  responsibilities: string[];
  experience_requirement: string;
  education_requirement: string;
  tools: string[];
  frameworks: string[];
  domain: string;
  description: string;
}

export interface ResumeVersion {
  version_id: string;
  target_role: string;
  job_id?: string;
  full_name: string;
  contact_info: string;
  professional_summary: string;
  skills_section: string[];
  experience_section: string[];
  projects_section: string[];
  education_section: string[];
  certifications_section: string[];
  achievements_section: string[];
  used_skills: Record<string, string>;
  used_projects: string[];
  used_experience_ids: number[];
  created_at: string;
  content_text: string;
  validation_status: 'PENDING' | 'VALID' | 'INVALID';
}

export interface ResumeAnalysis {
  version_id: string;
  job_id: string;
  overall_match: number;
  skill_match: number;
  project_match: number;
  experience_match: number;
  keyword_match: number;
  education_match: number;
  matched_skills: string[];
  related_skills: string[];
  missing_skills: string[];
  matched_keywords: string[];
  missing_keywords: string[];
  recommendations: string[];
}

export interface ValidationReport {
  overall_valid: boolean;
  sections: Record<string, {
    valid: boolean;
    issues: string[];
  }>;
  total_issues: number;
  all_issues: string[];
  warnings?: string;
}

export interface ATSOptimizationResult {
  overall_ats_score: number;
  score_breakdown: {
    formatting: number;
    contact_info: number;
    section_consistency: number;
  };
  issues: {
    formatting: string[];
    contact_info: string[];
    section_consistency: string[];
  };
  keyword_analysis: {
    found: number;
    total: number;
    keyword_details: Record<string, { count: number; density: number }>;
    recommendations: string[];
  };
  priority_fixes: string[];
}

export interface AgentResult {
  agent: string;
  status: 'ok' | 'failed';
  records_touched: number;
  time_seconds: number;
  notes?: string;
}

export interface Config {
  target_role: string;
  target_city: string;
  keywords: string[];
  my_skills: string[];
  experience_years: number;
  min_fit_score: number;
}

// ----------------------------------------------------
// EdgeDash Product Evolution Types
// ----------------------------------------------------

export interface ExplainableFitScore {
  overall_match: number;
  skills_match: number;
  experience_match: number;
  projects_match: number;
  education_match: number;
  semantic_match: number;
  strong_matches: string[];
  missing_skills: string[];
  recommendation: string;
}

export type ApplicationKanbanStatus = 
  | 'saved' 
  | 'applied' 
  | 'assessment' 
  | 'interview' 
  | 'offer' 
  | 'rejected';

export interface TrackedApplication {
  id: string;
  job_id: string;
  company: string;
  job_title: string;
  job_url?: string;
  location: string;
  salary?: string;
  status: ApplicationKanbanStatus;
  applied_date: string;
  resume_version_used?: string;
  resume_version?: string;
  cover_letter?: string;
  recruiter_name?: string;
  recruiter_email?: string;
  interview_date?: string;
  follow_up_date?: string;
  next_step?: string;
  notes?: string;
  fit_score?: number;
}

export interface UserResumeVersion {
  id: string;
  title: string;
  target_role: string;
  ats_score: number;
  version: number;
  updated_at: string;
  personal_info: {
    full_name: string;
    email: string;
    phone: string;
    location: string;
    title: string;
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
  };
  summary: string;
  technical_skills: string[];
  soft_skills: string[];
  experience: Experience[];
  projects: Project[];
  education: Education[];
  certifications: Certification[];
  achievements: string[];
  languages: string[];
  enabled_sections?: Record<string, boolean>;
}

export interface ApplicationPackData {
  job_id: string;
  job_title: string;
  company: string;
  resume: UserResumeVersion;
  cover_letter: {
    subject: string;
    content: string;
    recipient: string;
  };
  recruiter_email: {
    subject: string;
    body: string;
  };
  linkedin_message: string;
  interview_questions: Array<{
    category: 'Technical' | 'Behavioral' | 'HR' | 'Project' | 'JD-Specific';
    question: string;
    sample_answer_approach: string;
  }>;
}

export interface MockInterviewQuestion {
  id: string;
  category: 'Technical' | 'Behavioral' | 'HR' | 'Project' | 'JD-Specific';
  question: string;
  tips: string;
  candidate_answer?: string;
  ai_evaluation?: {
    technical_accuracy: number;
    communication: number;
    relevance: number;
    confidence: number;
    structure: number;
    clarity: number;
    overall_score: number;
    strengths: string[];
    improvements: string[];
    model_answer: string;
  };
}

export interface RoadmapSkillItem {
  id: string;
  skill: string;
  completed: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  market_demand_pct: number;
  estimated_weeks: string;
  prerequisites: string[];
  why_learn: string;
}

export interface RoadmapWeek {
  week_number: number;
  title: string;
  description: string;
  skills: RoadmapSkillItem[];
}

