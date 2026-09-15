import { CandidateProfile, JobListing, ExplainableFitScore } from '../types';

// Semantic taxonomy and synonym mappings for career intelligence
export const SEMANTIC_CLUSTERS: Record<string, string[]> = {
  'data manipulation': ['pandas', 'numpy', 'polars', 'dask', 'scipy', 'r'],
  'data visualization': ['power bi', 'tableau', 'looker', 'matplotlib', 'seaborn', 'plotly', 'dash', 'excel'],
  'relational databases': ['sql', 'postgresql', 'mysql', 'sql server', 'oracle', 'sqlite', 'snowflake'],
  'cloud deployment': ['aws', 'gcp', 'azure', 'docker', 'kubernetes', 'cloud computing', 's3', 'ec2'],
  'etl & pipelines': ['etl', 'airflow', 'dbt', 'kafka', 'spark', 'pyspark', 'data pipeline', 'databricks'],
  'machine learning': ['machine learning', 'scikit-learn', 'regression', 'classification', 'clustering', 'xgboost', 'random forest', 'predictive modeling'],
  'deep learning': ['deep learning', 'pytorch', 'tensorflow', 'keras', 'neural networks', 'nlp', 'llm', 'computer vision'],
  'version control & devops': ['git', 'github', 'gitlab', 'ci/cd', 'bash', 'linux', 'containers'],
  'business intelligence': ['business intelligence', 'kpi tracking', 'metrics', 'a/b testing', 'reporting', 'executive dashboards', 'statistical analysis'],
  'data modeling & warehousing': ['data warehousing', 'data modeling', 'star schema', 'snowflake schema', 'bigquery', 'redshift', 'synapse']
};

/**
 * Normalizes skill names and checks semantic synonym presence
 */
export function normalizeSkill(skill: string): string {
  return skill.toLowerCase().trim().replace(/[^a-z0-9+#]/g, '');
}

/**
 * Checks if a candidate skill satisfies a JD requirement directly or semantically
 */
export function matchesSkillOrSynonym(candidateSkills: string[], requiredSkill: string): { matched: boolean; matchedWith?: string } {
  const normReq = normalizeSkill(requiredSkill);
  const normCandidate = candidateSkills.map(s => normalizeSkill(s));

  // Direct match
  const directIdx = normCandidate.findIndex(cs => cs === normReq || cs.includes(normReq) || normReq.includes(cs));
  if (directIdx !== -1) {
    return { matched: true, matchedWith: candidateSkills[directIdx] };
  }

  // Cluster / Semantic match
  for (const [clusterKey, synonyms] of Object.entries(SEMANTIC_CLUSTERS)) {
    const isClusterMatch = normReq.includes(normalizeSkill(clusterKey)) || synonyms.some(syn => normReq.includes(normalizeSkill(syn)));
    if (isClusterMatch) {
      // Look for any candidate skill in the same cluster
      const candidateSynonym = candidateSkills.find(cs => 
        synonyms.some(syn => normalizeSkill(cs) === normalizeSkill(syn))
      );
      if (candidateSynonym) {
        return { matched: true, matchedWith: `${candidateSynonym} (Semantic: ${clusterKey})` };
      }
    }
  }

  return { matched: false };
}

/**
 * Advanced Semantic & BM25 Job Matching Engine
 * Produces an Explainable Fit Score with transparent breakdown
 */
export class SemanticMatcher {
  static evaluate(job: JobListing, candidate: CandidateProfile): ExplainableFitScore {
    const candidateSkillNames = candidate.skills.map(s => s.skill_name);
    const candidateProjects = candidate.projects || [];
    const candidateExperiences = candidate.experience || [];
    const candidateEducation = candidate.education || [];

    const jobText = `${job.title} ${job.description} ${job.company}`.toLowerCase();

    // 1. Extract requirements from JD text
    const commonTechSkills = [
      'Python', 'SQL', 'Pandas', 'NumPy', 'Power BI', 'Tableau', 'Excel', 
      'R', 'Machine Learning', 'Statistics', 'Docker', 'AWS', 'GCP', 
      'Azure', 'Git', 'Airflow', 'Spark', 'PySpark', 'ETL', 'PostgreSQL',
      'MySQL', 'Snowflake', 'BigQuery', 'Scikit-learn', 'Data Modeling'
    ];

    const jdRequiredSkills = commonTechSkills.filter(tech => {
      const reg = new RegExp(`\\b${tech.toLowerCase()}\\b`, 'i');
      return reg.test(jobText);
    });

    // Default fallback if JD is brief
    const targetRequired = jdRequiredSkills.length > 0 
      ? jdRequiredSkills 
      : ['Python', 'SQL', 'Data Analysis', 'Excel'];

    // 2. Compute Skills Match & Semantic Match
    const strongMatches: string[] = [];
    const missingSkills: string[] = [];
    let semanticMatchesCount = 0;

    targetRequired.forEach(reqSkill => {
      const { matched, matchedWith } = matchesSkillOrSynonym(candidateSkillNames, reqSkill);
      if (matched) {
        strongMatches.push(reqSkill);
        if (matchedWith && matchedWith.includes('Semantic:')) {
          semanticMatchesCount++;
        }
      } else {
        missingSkills.push(reqSkill);
      }
    });

    const skillsMatch = Math.min(100, Math.round((strongMatches.length / Math.max(1, targetRequired.length)) * 100));
    const semanticMatch = Math.min(100, Math.round(((strongMatches.length + semanticMatchesCount * 0.5) / Math.max(1, targetRequired.length)) * 100));

    // 3. Compute Experience Match
    let experienceMatch = 70; // baseline
    const totalExpYears = candidateExperiences.length > 0
      ? candidateExperiences.length * 1.5
      : 1;

    if (jobText.includes('senior') || jobText.includes('lead') || jobText.includes('5+ years')) {
      experienceMatch = totalExpYears >= 4 ? 90 : (totalExpYears >= 2 ? 70 : 55);
    } else if (jobText.includes('junior') || jobText.includes('entry') || jobText.includes('intern') || jobText.includes('0-2 years')) {
      experienceMatch = 95;
    } else {
      experienceMatch = totalExpYears >= 2 ? 88 : 80;
    }

    // 4. Compute Projects Match
    let projectsMatch = 65;
    const projectSkills = candidateProjects.flatMap(p => [...p.skills_used, ...p.keywords]).map(s => s.toLowerCase());
    const matchedProjectSkills = targetRequired.filter(req => projectSkills.some(ps => ps.includes(req.toLowerCase())));
    projectsMatch = Math.min(100, Math.round(50 + (matchedProjectSkills.length / Math.max(1, targetRequired.length)) * 50));

    // 5. Compute Education Match
    let educationMatch = 85;
    const hasDegree = candidateEducation.length > 0;
    const isTechDegree = candidateEducation.some(e => 
      /computer|data|engineering|science|statistics|information/i.test(e.degree + ' ' + e.field_of_study)
    );
    if (hasDegree && isTechDegree) {
      educationMatch = 98;
    } else if (hasDegree) {
      educationMatch = 88;
    }

    // 6. Overall Weighted Match Score
    // 35% Skills, 25% Semantic, 20% Projects, 10% Experience, 10% Education
    const overallMatch = Math.min(
      99,
      Math.max(
        25,
        Math.round(
          skillsMatch * 0.35 +
          semanticMatch * 0.25 +
          projectsMatch * 0.20 +
          experienceMatch * 0.10 +
          educationMatch * 0.10
        )
      )
    );

    // 7. Contextual AI Recommendation
    let recommendation = '';
    if (strongMatches.length >= 3 && missingSkills.length === 0) {
      recommendation = `Exceptional alignment! Your verified mastery in ${strongMatches.slice(0, 3).join(', ')} directly fulfills every requirement. Highly recommend applying immediately.`;
    } else if (strongMatches.length >= 2) {
      const gapText = missingSkills.length > 0 ? `Target skill gap: ${missingSkills.slice(0, 2).join(', ')}.` : '';
      recommendation = `Strong profile fit! Core expertise in ${strongMatches.slice(0, 3).join(', ')} gives you an edge. ${gapText} Highlight your hands-on project implementations.`;
    } else {
      recommendation = `Developing match. Highlight your transferable analytics and engineering skills. Focus on closing ${missingSkills.slice(0, 2).join(' and ')} via the learning roadmap.`;
    }

    return {
      overall_match: overallMatch,
      skills_match: skillsMatch,
      experience_match: experienceMatch,
      projects_match: projectsMatch,
      education_match: educationMatch,
      semantic_match: semanticMatch,
      strong_matches: strongMatches,
      missing_skills: missingSkills,
      recommendation
    };
  }
}
