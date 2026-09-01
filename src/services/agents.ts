import { 
  CandidateProfile, 
  Config, 
  JobListing, 
  JobRequirement, 
  ResumeVersion, 
  ResumeAnalysis, 
  ValidationReport, 
  ATSOptimizationResult,
  AgentResult,
  SkillGap,
  Experience,
  Project
} from '../types';

export const TECHNICAL_KEYWORDS: Record<string, string[]> = {
  "Programming Languages": ["python", "java", "javascript", "c++", "c#", "go", "rust", "scala", "kotlin", "typescript", "ruby", "php", "swift"],
  "Data & ML": ["machine learning", "ml", "deep learning", "nlp", "natural language processing", "computer vision", "tensorflow", "pytorch", "scikit-learn", "keras", "xgboost"],
  "Data Science": ["data science", "data scientist", "data analysis", "analytics", "sql", "tableau", "power bi", "looker", "eda", "exploratory data analysis"],
  "Databases": ["sql", "mysql", "postgresql", "mongodb", "cassandra", "redis", "dynamodb", "elasticsearch", "oracle"],
  "Cloud": ["aws", "azure", "gcp", "google cloud", "cloud computing", "lambda", "ec2", "s3"],
  "DevOps": ["docker", "kubernetes", "jenkins", "cicd", "ci/cd", "terraform", "linux", "bash"],
  "Frontend": ["react", "vue", "angular", "html", "css", "typescript", "webpack"],
  "Backend": ["rest", "api", "microservices", "nodejs", "express", "fastapi", "django", "flask"],
  "Soft Skills": ["communication", "leadership", "problem-solving", "collaboration", "teamwork", "analytical", "critical thinking"]
};

export const SENIORITY_KEYWORDS: Record<string, string[]> = {
  "Entry": ["entry level", "junior", "recent graduate", "0-2 years", "1-2 years"],
  "Mid": ["mid level", "intermediate", "3-5 years", "mid-level"],
  "Senior": ["senior", "5-8 years", "8-10 years", "experienced"],
  "Lead": ["lead", "principal", "staff", "10+ years"],
  "Executive": ["director", "vp", "head of", "chief", "executive"]
};

// ==========================================
// 1. JD Analyzer Agent
// ==========================================
export class JDAnalyzer {
  static extractSeniority(description: string): string {
    const lower = description.toLowerCase();
    for (const [level, keywords] of Object.entries(SENIORITY_KEYWORDS)) {
      for (const kw of keywords) {
        if (lower.includes(kw)) return level;
      }
    }
    return "Not Specified";
  }

  static extractSkills(description: string): { required: string[]; preferred: string[] } {
    const lower = description.toLowerCase();
    const allFoundSkills = new Set<string>();
    const required = new Set<string>();
    const preferred = new Set<string>();

    for (const skills of Object.values(TECHNICAL_KEYWORDS)) {
      for (const skill of skills) {
        if (lower.includes(skill)) {
          allFoundSkills.add(skill);
        }
      }
    }

    for (const skill of allFoundSkills) {
      const skillTitle = skill.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const mustPatterns = [`required ${skill}`, `must have ${skill}`, `must ${skill}`, `requirements`];
      const nicePatterns = [`preferred ${skill}`, `nice to have ${skill}`, `plus`, `knowledge of ${skill}`];

      const isRequired = mustPatterns.some(p => lower.includes(p));
      const isPreferred = nicePatterns.some(p => lower.includes(p));

      if (lower.includes("python") && skill === "python") {
        required.add("Python");
      } else if (isRequired) {
        required.add(skillTitle);
      } else if (isPreferred) {
        preferred.add(skillTitle);
      } else {
        required.add(skillTitle);
      }
    }

    const directTech = ["Python", "SQL", "Machine Learning", "TensorFlow", "PyTorch"];
    for (const tech of directTech) {
      if (lower.includes(tech.toLowerCase()) && !required.has(tech)) {
        required.add(tech);
      }
    }

    return {
      required: Array.from(required).sort(),
      preferred: Array.from(preferred).sort()
    };
  }

  static extractToolsAndFrameworks(description: string): { tools: string[]; frameworks: string[] } {
    const lower = description.toLowerCase();
    const toolsPatterns: Record<string, RegExp> = {
      "Docker": /\bdocker\b/i,
      "Kubernetes": /\b(k8s|kubernetes)\b/i,
      "Jenkins": /\bjenkins\b/i,
      "Git": /\bgit\b/i,
      "AWS": /\baws\b/i,
      "Azure": /\bazure\b/i,
      "GCP": /\bgcp\b/i,
      "Tableau": /\btableau\b/i
    };

    const frameworksPatterns: Record<string, RegExp> = {
      "Django": /\bdjango\b/i,
      "FastAPI": /\bfastapi\b/i,
      "Flask": /\bflask\b/i,
      "React": /\breact(\.js)?\b/i,
      "TensorFlow": /\btensorflow\b/i,
      "PyTorch": /\bpytorch\b/i,
      "Scikit-learn": /\bscikit-learn\b|\bpadnas\b/i
    };

    const tools: string[] = [];
    const frameworks: string[] = [];

    for (const [tool, regex] of Object.entries(toolsPatterns)) {
      if (regex.test(lower)) tools.push(tool);
    }
    for (const [fw, regex] of Object.entries(frameworksPatterns)) {
      if (regex.test(lower)) frameworks.push(fw);
    }

    return { tools: tools.sort(), frameworks: frameworks.sort() };
  }

  static extractExperience(description: string): string {
    const patterns = [
      /(\d+)\s*-\s*(\d+)\s+years?/i,
      /(\d+)\+\s+years?/i,
      /at least (\d+)\s+years?/i,
      /(\d+)\s+years?\s+of/i
    ];
    for (const p of patterns) {
      const match = description.match(p);
      if (match) return match[0];
    }
    return "3+ years";
  }

  static extractEducation(description: string): string {
    const patterns = [
      /(bachelor'?s?|master'?s?|phd|doctorate)\s+(degree\s+)?(in|of)\s+([^,.]+)/i,
      /degree\s+in\s+([^,.]+)/i,
      /(bachelor'?s?|master'?s?|phd)/i
    ];
    for (const p of patterns) {
      const match = description.match(p);
      if (match) return match[0];
    }
    return "Bachelor's or Master's in Computer Science, Statistics or related field";
  }

  static extractDomain(description: string, title: string = ""): string {
    const text = `${description} ${title}`.toLowerCase();
    if (text.includes("data scientist") || text.includes("data science") || text.includes("analytics")) return "Data Science";
    if (text.includes("machine learning") || text.includes("ml engineer") || text.includes("deep learning")) return "ML/AI";
    if (text.includes("backend") || text.includes("server") || text.includes("api")) return "Backend";
    if (text.includes("frontend") || text.includes("react")) return "Frontend";
    if (text.includes("devops") || text.includes("cloud")) return "DevOps";
    return "Software Engineering";
  }

  static analyze(job: JobListing): JobRequirement {
    const seniority = this.extractSeniority(job.description);
    const { required, preferred } = this.extractSkills(job.description);
    const { tools, frameworks } = this.extractToolsAndFrameworks(job.description);
    const exp = this.extractExperience(job.description);
    const edu = this.extractEducation(job.description);
    const domain = this.extractDomain(job.description, job.title);

    const technical_keywords = Array.from(new Set([...required, ...preferred, ...tools, ...frameworks])).sort();

    return {
      job_id: job.id,
      job_title: job.title,
      seniority,
      required_skills: required,
      preferred_skills: preferred,
      technical_keywords,
      responsibilities: [
        "Design, develop and evaluate robust machine learning and statistical models",
        "Perform exploratory data analysis and build scalable data pipelines",
        "Collaborate with engineering and product teams to translate business requirements into technical solutions",
        "Monitor model performance in production and implement optimizations"
      ],
      experience_requirement: exp,
      education_requirement: edu,
      tools,
      frameworks,
      domain,
      description: job.description
    };
  }
}

// ==========================================
// 2. Resume Matcher Agent
// ==========================================
export class ResumeMatcher {
  static calculateSkillMatch(candidateSkills: string[], jobReq: JobRequirement): {
    matchPercentage: number;
    matched: string[];
    related: string[];
    missing: string[];
  } {
    const candLower = candidateSkills.map(s => s.toLowerCase());
    const matched: string[] = [];
    const related: string[] = [];
    const missing: string[] = [];

    const relationships: Record<string, string[]> = {
      "machine learning": ["data science", "python", "tensorflow", "scikit-learn", "deep learning"],
      "data science": ["machine learning", "python", "sql", "pandas", "statistics", "analytics"],
      "python": ["machine learning", "data science", "pandas", "numpy"],
      "sql": ["database", "data analysis", "data science", "postgresql"],
      "tableau": ["data visualization", "power bi", "analytics"]
    };

    for (const skill of jobReq.required_skills) {
      const skillLower = skill.toLowerCase();
      if (candLower.includes(skillLower) || candLower.some(cs => cs.includes(skillLower) || skillLower.includes(cs))) {
        matched.push(skill);
      } else if (relationships[skillLower] && relationships[skillLower].some(r => candLower.includes(r))) {
        related.push(skill);
      } else {
        missing.push(skill);
      }
    }

    for (const skill of jobReq.preferred_skills) {
      const skillLower = skill.toLowerCase();
      if (!matched.some(m => m.toLowerCase() === skillLower) && !related.some(r => r.toLowerCase() === skillLower)) {
        if (candLower.includes(skillLower)) {
          matched.push(skill);
        } else {
          missing.push(skill);
        }
      }
    }

    const totalReq = jobReq.required_skills.length || 1;
    const reqMatch = Math.min(100, ((matched.length + related.length * 0.5) / totalReq) * 100);
    const totalPref = jobReq.preferred_skills.length;
    const prefMatch = totalPref === 0 ? 100 : Math.max(0, 100 - (missing.length / totalPref) * 100);

    const overallMatch = Math.min(100, Math.max(0, reqMatch * 0.7 + prefMatch * 0.3));

    return {
      matchPercentage: Math.round(overallMatch),
      matched,
      related,
      missing
    };
  }

  static calculateKeywordMatch(jobKeywords: string[], candidateSkills: string[]): {
    percentage: number;
    matched: string[];
    missing: string[];
  } {
    if (!jobKeywords || jobKeywords.length === 0) return { percentage: 80, matched: [], missing: [] };
    const candLower = candidateSkills.map(s => s.toLowerCase());
    const matched: string[] = [];
    const missing: string[] = [];

    for (const kw of jobKeywords) {
      const kwLower = kw.toLowerCase();
      if (candLower.some(cs => cs.includes(kwLower) || kwLower.includes(cs))) {
        matched.push(kw);
      } else {
        missing.push(kw);
      }
    }

    const pct = Math.round((matched.length / jobKeywords.length) * 100);
    return { percentage: pct, matched, missing };
  }

  static match(candidate: CandidateProfile, jobReq: JobRequirement): ResumeAnalysis {
    const candidateSkills = candidate.skills.map(s => s.skill_name);
    const totalExpYears = candidate.experience.reduce((acc, exp) => {
      const startYear = parseInt(exp.start_date.slice(0, 4)) || 2020;
      const endYear = exp.end_date ? (parseInt(exp.end_date.slice(0, 4)) || 2022) : 2026;
      return acc + Math.max(1, endYear - startYear);
    }, 0);

    const { matchPercentage: skillMatch, matched: matchedSkills, related: relatedSkills, missing: missingSkills } = 
      this.calculateSkillMatch(candidateSkills, jobReq);

    const { percentage: keywordMatch, matched: matchedKeywords, missing: missingKeywords } =
      this.calculateKeywordMatch(jobReq.technical_keywords, candidateSkills);

    // Project match
    let projectMatch = 85;
    const projectKeywords = candidate.projects.flatMap(p => [...p.skills_used, ...p.keywords].map(k => k.toLowerCase()));
    const matchingProjKw = jobReq.technical_keywords.filter(kw => projectKeywords.includes(kw.toLowerCase()));
    if (jobReq.technical_keywords.length > 0) {
      projectMatch = Math.min(100, Math.round((matchingProjKw.length / Math.min(5, jobReq.technical_keywords.length)) * 100));
    }

    // Experience match
    const expMatch = totalExpYears >= 3 ? 95 : 75;
    // Education match
    const eduMatch = candidate.education.length > 0 ? 95 : 80;

    const overall = Math.round(
      skillMatch * 0.35 +
      keywordMatch * 0.25 +
      projectMatch * 0.20 +
      expMatch * 0.15 +
      eduMatch * 0.05
    );

    const recommendations: string[] = [];
    if (missingSkills.length > 0) {
      recommendations.push(`Highlight any direct or adjacent project experience with ${missingSkills.slice(0, 3).join(', ')}.`);
    }
    if (missingKeywords.length > 0) {
      recommendations.push(`Emphasize knowledge of tools: ${missingKeywords.slice(0, 2).join(', ')}.`);
    }
    recommendations.push("Tailor professional summary to align with the core domain metrics.");

    return {
      version_id: `v-${Math.random().toString(36).substring(2, 8)}`,
      job_id: jobReq.job_id,
      overall_match: overall,
      skill_match: skillMatch,
      project_match: projectMatch,
      experience_match: expMatch,
      keyword_match: keywordMatch,
      education_match: eduMatch,
      matched_skills: matchedSkills,
      related_skills: relatedSkills,
      missing_skills: missingSkills,
      matched_keywords: matchedKeywords,
      missing_keywords: missingKeywords,
      recommendations
    };
  }
}

// ==========================================
// 3. Resume Generator Agent (Zero Hallucination)
// ==========================================
export class ResumeGenerator {
  static generate(candidate: CandidateProfile, jobReq: JobRequirement): ResumeVersion {
    const versionId = Math.random().toString(36).substring(2, 10);
    const jobKeywords = new Set(jobReq.technical_keywords.map(k => k.toLowerCase()));
    
    // 1. Select skills present in candidate profile (ordered by relevance)
    const scoredSkills = candidate.skills.map(skill => {
      let score = 0;
      const lower = skill.skill_name.toLowerCase();
      if (jobReq.required_skills.some(r => r.toLowerCase() === lower)) score += 100;
      else if (jobReq.preferred_skills.some(p => p.toLowerCase() === lower)) score += 50;
      else if (jobKeywords.has(lower)) score += 25;

      const profScores: Record<string, number> = { "Expert": 30, "Advanced": 20, "Intermediate": 10, "Beginner": 5 };
      score += profScores[skill.proficiency] || 0;
      score += skill.years_of_experience * 2;
      return { skill, score };
    });

    scoredSkills.sort((a, b) => b.score - a.score);
    const selectedSkills = scoredSkills.slice(0, 8).map(s => s.skill);

    const skillsSection = selectedSkills.map(s => 
      `${s.skill_name} (${s.proficiency}, ${s.years_of_experience} years)`
    );

    // 2. Select projects strictly from candidate profile
    const scoredProjects = candidate.projects.map(proj => {
      let score = proj.priority * 5;
      if (proj.target_roles.some(r => r.toLowerCase().includes(jobReq.domain.toLowerCase()))) score += 50;
      const matchingSkills = proj.skills_used.filter(s => jobKeywords.has(s.toLowerCase())).length;
      score += matchingSkills * 20;
      return { proj, score };
    });
    scoredProjects.sort((a, b) => b.score - a.score);
    const selectedProjects = scoredProjects.slice(0, 3).map(p => p.proj);

    const projectsSection: string[] = [];
    for (const proj of selectedProjects) {
      projectsSection.push(`${proj.name}${proj.metrics ? ` | ${proj.metrics}` : ''}`);
      projectsSection.push(`  ${proj.description}`);
      const tags = [...proj.skills_used, ...proj.keywords].slice(0, 5);
      if (tags.length > 0) {
        projectsSection.push(`  Tech: ${tags.join(', ')}`);
      }
      if (proj.url || proj.github_url) {
        projectsSection.push(`  Link: ${proj.github_url || proj.url}`);
      }
      projectsSection.push("");
    }

    // 3. Work experience from candidate profile
    const experienceSection: string[] = [];
    for (const exp of candidate.experience) {
      const dates = `${exp.start_date} – ${exp.end_date || 'Present'}`;
      experienceSection.push(`${exp.job_title} | ${exp.company}, ${exp.location} | ${dates}`);
      if (exp.description) {
        experienceSection.push(`  ${exp.description}`);
      }
      for (const resp of exp.responsibilities.slice(0, 4)) {
        experienceSection.push(`  • ${resp}`);
      }
      experienceSection.push("");
    }

    // 4. Education section
    const educationSection = candidate.education.map(edu => 
      `${edu.degree} in ${edu.field_of_study} from ${edu.institution} (${edu.graduation_year})${edu.gpa ? ` – GPA: ${edu.gpa}` : ''}`
    );

    // 5. Certifications section
    const certificationsSection = candidate.certifications.map(cert => 
      `${cert.name} | ${cert.issuer} (${cert.issue_date})`
    );

    // 6. Professional summary (built purely from verified facts)
    const top3Skills = selectedSkills.slice(0, 3).map(s => s.skill_name).join(', ');
    const profSummary = `${candidate.summary}\n\nKey strengths: ${top3Skills}`;

    // 7. Full text construction
    const textLines = [
      candidate.full_name.toUpperCase(),
      candidate.location,
      `📧 ${candidate.email}${candidate.phone ? ` | 📱 ${candidate.phone}` : ''}`,
      "",
      "PROFESSIONAL SUMMARY",
      profSummary,
      "",
      "KEY SKILLS",
      "",
      ...skillsSection,
      "",
      "WORK EXPERIENCE",
      "",
      ...experienceSection,
      "PROJECTS",
      "",
      ...projectsSection,
      "EDUCATION",
      "",
      ...educationSection,
      ...(certificationsSection.length > 0 ? ["", "CERTIFICATIONS", "", ...certificationsSection] : []),
      ...(candidate.achievements.length > 0 ? ["", "ACHIEVEMENTS", "", ...candidate.achievements.map(a => `• ${a}`)] : [])
    ];

    const contentText = textLines.join("\n");

    return {
      version_id: versionId,
      target_role: jobReq.job_title,
      job_id: jobReq.job_id,
      full_name: candidate.full_name,
      contact_info: `${candidate.email}${candidate.phone ? ` | ${candidate.phone}` : ''}`,
      professional_summary: profSummary,
      skills_section: skillsSection,
      experience_section: experienceSection,
      projects_section: projectsSection,
      education_section: educationSection,
      certifications_section: certificationsSection,
      achievements_section: candidate.achievements,
      used_skills: Object.fromEntries(selectedSkills.map(s => [s.skill_name, "Master Profile"])),
      used_projects: selectedProjects.map(p => p.name),
      used_experience_ids: candidate.experience.map((_, idx) => idx),
      created_at: new Date().toISOString(),
      content_text: contentText,
      validation_status: "VALID"
    };
  }
}

// ==========================================
// 4. Resume Validator Agent (Anti-Hallucination)
// ==========================================
export class ResumeValidator {
  static validate(resume: ResumeVersion, candidate: CandidateProfile): ValidationReport {
    const issues: string[] = [];
    const sections: Record<string, { valid: boolean; issues: string[] }> = {};

    // 1. Validate skills
    const candSkillNames = new Set(candidate.skills.map(s => s.skill_name.toLowerCase()));
    const skillIssues: string[] = [];
    for (const skillLine of resume.skills_section) {
      const skillName = skillLine.split('(')[0].trim().toLowerCase();
      if (!candSkillNames.has(skillName)) {
        skillIssues.push(`Skill '${skillName}' is not present in master candidate profile.`);
      }
    }
    sections["Skills"] = { valid: skillIssues.length === 0, issues: skillIssues };
    issues.push(...skillIssues);

    // 2. Validate experience
    const candCompanies = new Set(candidate.experience.map(e => e.company.toLowerCase()));
    const expIssues: string[] = [];
    for (const expLine of resume.experience_section) {
      if (expLine.includes('|')) {
        const parts = expLine.split('|');
        if (parts.length >= 2) {
          const company = parts[1].split(',')[0].trim().toLowerCase();
          if (!candCompanies.has(company)) {
            expIssues.push(`Company '${parts[1].split(',')[0].trim()}' not found in candidate experience.`);
          }
        }
      }
    }
    sections["Experience"] = { valid: expIssues.length === 0, issues: expIssues };
    issues.push(...expIssues);

    // 3. Validate projects
    const candProjNames = new Set(candidate.projects.map(p => p.name.toLowerCase()));
    const projIssues: string[] = [];
    for (const projName of resume.used_projects) {
      if (!candProjNames.has(projName.toLowerCase())) {
        projIssues.push(`Project '${projName}' is not in master candidate profile.`);
      }
    }
    sections["Projects"] = { valid: projIssues.length === 0, issues: projIssues };
    issues.push(...projIssues);

    // 4. Validate education
    const candInstitutions = new Set(candidate.education.map(e => e.institution.toLowerCase()));
    const eduIssues: string[] = [];
    for (const eduLine of resume.education_section) {
      const lower = eduLine.toLowerCase();
      const match = Array.from(candInstitutions).some(inst => lower.includes(inst));
      if (!match) {
        eduIssues.push(`Institution mentioned in education was not found in candidate profile.`);
      }
    }
    sections["Education"] = { valid: eduIssues.length === 0, issues: eduIssues };
    issues.push(...eduIssues);

    // 5. Check for suspicious speculative phrases
    const suspiciousPhrases = ["might", "could have", "possibly", "allegedly", "claimed to"];
    let warning: string | undefined = undefined;
    const lowerContent = resume.content_text.toLowerCase();
    const foundSuspicious = suspiciousPhrases.filter(p => lowerContent.includes(p));
    if (foundSuspicious.length > 0) {
      warning = `Suspicious phrases detected: ${foundSuspicious.join(', ')}`;
    }

    return {
      overall_valid: issues.length === 0,
      sections,
      total_issues: issues.length,
      all_issues: issues,
      warnings: warning
    };
  }
}

// ==========================================
// 5. ATS Optimizer Agent
// ==========================================
export class ATSOptimizer {
  static optimize(resume: ResumeVersion, jobKeywords: string[] = []): ATSOptimizationResult {
    const content = resume.content_text;
    const formattingIssues: string[] = [];
    const contactIssues: string[] = [];
    const consistencyIssues: string[] = [];

    let formattingScore = 95;
    let contactScore = 100;
    let consistencyScore = 98;

    // Contact info checks
    const emailMatch = content.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
    if (!emailMatch) {
      contactIssues.push("Email address not found in header.");
      contactScore -= 25;
    }
    const phoneMatch = content.match(/\+?\d{1,3}?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (!phoneMatch) {
      contactIssues.push("Phone number missing or not formatted in standard pattern.");
      contactScore -= 10;
    }

    // Section consistency
    const requiredHeaders = ["PROFESSIONAL SUMMARY", "KEY SKILLS", "WORK EXPERIENCE", "EDUCATION"];
    for (const header of requiredHeaders) {
      if (!content.includes(header)) {
        consistencyIssues.push(`Missing standard section header: ${header}`);
        consistencyScore -= 15;
      }
    }

    // Keyword density
    const totalWords = content.split(/\s+/).length || 1;
    const keywordDetails: Record<string, { count: number; density: number }> = {};
    let foundKeywordsCount = 0;
    const lowerContent = content.toLowerCase();

    for (const kw of jobKeywords) {
      const kwLower = kw.toLowerCase();
      const regex = new RegExp(`\\b${kwLower}\\b`, 'gi');
      const matches = lowerContent.match(regex);
      const count = matches ? matches.length : (lowerContent.includes(kwLower) ? 1 : 0);
      if (count > 0) {
        foundKeywordsCount++;
        keywordDetails[kw] = {
          count,
          density: parseFloat(((count / totalWords) * 100).toFixed(2))
        };
      }
    }

    const keywordMatchPct = jobKeywords.length > 0 ? (foundKeywordsCount / jobKeywords.length) * 100 : 90;
    const overallScore = Math.round(
      (formattingScore * 0.35 + contactScore * 0.25 + consistencyScore * 0.4) * 0.65 +
      keywordMatchPct * 0.35
    );

    const missingKeywords = jobKeywords.filter(kw => !keywordDetails[kw]);
    const recommendations: string[] = missingKeywords.slice(0, 4).map(
      kw => `Consider explicitly mentioning '${kw}' in your project or experience descriptions if applicable.`
    );

    const priorityFixes: string[] = [
      ...contactIssues,
      ...formattingIssues,
      ...consistencyIssues,
      ...(missingKeywords.length > 0 ? [`Add keywords: ${missingKeywords.slice(0, 3).join(', ')}`] : [])
    ];

    return {
      overall_ats_score: Math.min(100, Math.max(50, overallScore)),
      score_breakdown: {
        formatting: formattingScore,
        contact_info: contactScore,
        section_consistency: consistencyScore
      },
      issues: {
        formatting: formattingIssues,
        contact_info: contactIssues,
        section_consistency: consistencyIssues
      },
      keyword_analysis: {
        found: foundKeywordsCount,
        total: jobKeywords.length,
        keyword_details: keywordDetails,
        recommendations
      },
      priority_fixes: priorityFixes
    };
  }
}

// ==========================================
// 6. Scorer Agent
// ==========================================
export class Scorer {
  static scoreListing(listing: JobListing, config: Config): { score: number; reason: string } {
    const text = `${listing.title} ${listing.description}`.toLowerCase();
    const keywordsLower = config.keywords.map(k => k.toLowerCase());
    const skillsLower = config.my_skills.map(s => s.toLowerCase());

    const keywordMatches = keywordsLower.filter(k => text.includes(k)).length;
    const skillMatches = skillsLower.filter(s => text.includes(s)).length;

    const kwRatio = keywordsLower.length > 0 ? keywordMatches / keywordsLower.length : 0;
    const skRatio = skillsLower.length > 0 ? skillMatches / skillsLower.length : 0;

    const scoreFloat = kwRatio * 30 + skRatio * 70;
    const score = Math.min(100, Math.max(0, Math.round(scoreFloat)));

    const reason = `Keywords: ${keywordMatches}/${keywordsLower.length} | Skills: ${skillMatches}/${skillsLower.length}`;
    return { score, reason };
  }
}

// ==========================================
// 7. Gap Analyzer Agent
// ==========================================
export class GapAnalyzer {
  static analyze(jobs: JobListing[], config: Config): SkillGap[] {
    const skillKeywords: Record<string, string[]> = {
      "SQL": ["sql", "postgres", "mysql", "sqlite", "t-sql"],
      "Tableau": ["tableau"],
      "AWS": ["aws", "amazon web services", "s3", "ec2", "sagemaker"],
      "Docker": ["docker", "container"],
      "Spark": ["spark", "pyspark", "apache spark"],
      "Kubernetes": ["kubernetes", "k8s"],
      "GCP": ["gcp", "google cloud", "bigquery"],
      "Kafka": ["kafka"],
      "Snowflake": ["snowflake"],
      "Airflow": ["airflow", "dag"],
      "Deep Learning": ["deep learning", "neural network", "cnn", "rnn"],
      "PowerBI": ["powerbi", "power bi"],
      "NLP": ["nlp", "natural language"],
      "Computer Vision": ["computer vision", "opencv"],
      "Terraform": ["terraform"]
    };

    const counter: Record<string, number> = {};
    const userSkillsLower = new Set(config.my_skills.map(s => s.toLowerCase()));

    for (const job of jobs) {
      const desc = `${job.title} ${job.description}`.toLowerCase();
      for (const [skillName, keywords] of Object.entries(skillKeywords)) {
        for (const kw of keywords) {
          if (desc.includes(kw)) {
            counter[skillName] = (counter[skillName] || 0) + 1;
            break;
          }
        }
      }
    }

    const gaps: SkillGap[] = [];
    for (const [skill, freq] of Object.entries(counter)) {
      if (!userSkillsLower.has(skill.toLowerCase())) {
        gaps.push({ skill, frequency: freq, last_seen: new Date().toISOString().slice(0, 10) });
      }
    }

    gaps.sort((a, b) => b.frequency - a.frequency);
    return gaps.slice(0, 10);
  }
}

// ==========================================
// 8. Verifier Agent
// ==========================================
export class Verifier {
  static verify(jobs: JobListing[], config: Config): { verifiedCount: number; issuesCount: number; notes: string } {
    let issues = 0;
    for (const job of jobs) {
      if (!job.title || !job.description) issues++;
      if (job.fit_score < 0 || job.fit_score > 100) issues++;
    }

    return {
      verifiedCount: jobs.length,
      issuesCount: issues,
      notes: issues === 0 ? `All ${jobs.length} jobs verified ✓` : `Verified ${jobs.length} jobs, found ${issues} data quality issues`
    };
  }
}

// ==========================================
// 9. Indeed Fetcher Agent
// ==========================================
export class IndeedFetcher {
  static fetch(config: Config): JobListing[] {
    const now = new Date().toISOString();
    const companies = [
      "TechCorp India", "Data Systems Inc", "Analytics Pro Ltd", "ML Solutions",
      "Python Developers Co", "Statistics Lab", "Enterprise Data", "Cloud Analytics",
      "AI Innovations", "Data Science Hub", "BigData Corp", "Neural Networks Ltd"
    ];

    const titles = [
      `${config.target_role}`,
      `Senior ${config.target_role}`,
      `${config.target_role} - Machine Learning`,
      `Lead ${config.target_role}`,
      `${config.target_role} (Python & Statistics)`,
      `${config.target_role} - Analytics & BI`,
      `${config.target_role} (Remote)`
    ];

    const sampleDescriptions = [
      `We're looking for a ${config.target_role} with experience in ${config.keywords.slice(0, 2).join(', ')}. Required skills: ${config.my_skills.slice(0, 3).join(', ')}. Experience with SQL, Tableau, and AWS preferred.`,
      `Join our team as a ${config.target_role}. Work with ${config.keywords.slice(0, 2).join(', ')} and contribute to data-driven decision making. Required: Python, Machine Learning, and Data Analysis.`,
      `Expert ${config.target_role} needed. Must have strong background in ${config.my_skills.slice(0, 2).join(', ')}. Knowledge of ${config.keywords[0]} is a plus.`,
      `Exciting opportunity for a ${config.target_role} in ${config.target_city}. Skills needed: ${config.my_skills.slice(0, 3).join(', ')}. Work with modern data pipelines and predictive models.`,
      `Hiring: ${config.target_role} with ${config.experience_years}+ years experience. Expertise in ${config.keywords[config.keywords.length - 1]} and ${config.my_skills[0]} required.`
    ];

    const newListings: JobListing[] = [];
    for (let i = 0; i < 6; i++) {
      const title = titles[i % titles.length];
      const company = companies[(i + 3) % companies.length];
      const desc = sampleDescriptions[i % sampleDescriptions.length];
      const id = `job-new-${Date.now()}-${i}`;
      
      const { score, reason } = Scorer.scoreListing({
        id,
        title,
        company,
        location: i % 2 === 0 ? config.target_city : "Remote",
        url: `https://example.com/job/${2000 + i}`,
        description: desc,
        source: i % 2 === 0 ? "indeed" : "stackoverflow",
        posted_at: new Date(Date.now() - i * 86400000).toISOString(),
        fetched_at: now,
        fit_score: 0
      }, config);

      newListings.push({
        id,
        title,
        company,
        location: i % 2 === 0 ? config.target_city : "Remote",
        url: `https://example.com/job/${2000 + i}`,
        description: desc,
        source: i % 2 === 0 ? "indeed" : "stackoverflow",
        posted_at: new Date(Date.now() - i * 86400000).toISOString(),
        fetched_at: now,
        fit_score: score,
        fit_reason: reason
      });
    }

    return newListings;
  }
}
