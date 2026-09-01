import { CandidateProfile, Config, JobListing, SkillGap } from '../types';

export const defaultConfig: Config = {
  target_role: "Data Scientist",
  target_city: "Indore",
  keywords: [
    "data science",
    "machine learning",
    "analytics",
    "Python",
    "statistics",
    "data analysis",
    "EDA"
  ],
  my_skills: [
    "Python",
    "EDA",
    "Statistics",
    "Data Preprocessing",
    "Data Cleaning",
    "Data Visualization",
    "Machine Learning",
    "Data Analysis"
  ],
  experience_years: 3,
  min_fit_score: 60
};

export const defaultCandidateProfile: CandidateProfile = {
  full_name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1-555-0100",
  location: "San Francisco, CA",
  summary: "Data Scientist with 5+ years of experience in building machine learning pipelines and driving business insights through data analysis.",
  target_roles: [
    "Data Scientist",
    "Machine Learning Engineer",
    "Analytics Engineer"
  ],
  github_url: "https://github.com/johndoe",
  linkedin_url: "https://linkedin.com/in/johndoe",
  portfolio_url: "https://johndoe-portfolio.com",
  skills: [
    { skill_name: "Python", proficiency: "Expert", years_of_experience: 5, category: "Technical", endorsements: 42 },
    { skill_name: "Machine Learning", proficiency: "Expert", years_of_experience: 5, category: "Technical", endorsements: 38 },
    { skill_name: "SQL", proficiency: "Advanced", years_of_experience: 4, category: "Technical", endorsements: 35 },
    { skill_name: "Data Analysis", proficiency: "Expert", years_of_experience: 5, category: "Technical", endorsements: 40 },
    { skill_name: "Pandas", proficiency: "Expert", years_of_experience: 4, category: "Technical", endorsements: 30 },
    { skill_name: "Scikit-learn", proficiency: "Advanced", years_of_experience: 4, category: "Technical", endorsements: 25 },
    { skill_name: "TensorFlow", proficiency: "Intermediate", years_of_experience: 2, category: "Technical", endorsements: 18 },
    { skill_name: "Data Visualization", proficiency: "Advanced", years_of_experience: 5, category: "Technical", endorsements: 32 }
  ],
  experience: [
    {
      company: "Tech Data Inc",
      job_title: "Senior Data Scientist",
      start_date: "2022-06",
      end_date: null,
      description: "Leading data science initiatives and ML model development",
      location: "San Francisco, CA",
      responsibilities: [
        "Designed and deployed 5+ ML models improving business metrics by 20-30%",
        "Mentored junior data scientists on ML best practices",
        "Led cross-functional teams to deliver data-driven solutions",
        "Optimized data pipelines reducing processing time by 40%"
      ],
      skills_demonstrated: [
        "Python",
        "Machine Learning",
        "SQL",
        "TensorFlow",
        "Leadership",
        "Problem Solving"
      ]
    },
    {
      company: "Analytics Pro Corp",
      job_title: "Data Scientist",
      start_date: "2019-03",
      end_date: "2022-05",
      description: "Built and maintained predictive models and analytics dashboards",
      location: "San Jose, CA",
      responsibilities: [
        "Developed predictive models for customer churn achieving 85% accuracy",
        "Created dashboards for executive reporting used by 50+ stakeholders",
        "Conducted exploratory data analysis on 100M+ records datasets",
        "Automated ETL processes using Python and SQL"
      ],
      skills_demonstrated: [
        "Python",
        "Data Analysis",
        "SQL",
        "Pandas",
        "Scikit-learn",
        "Tableau"
      ]
    },
    {
      company: "DataStats LLC",
      job_title: "Junior Data Analyst",
      start_date: "2018-01",
      end_date: "2019-02",
      description: "Data analysis and business intelligence support",
      location: "San Jose, CA",
      responsibilities: [
        "Analyzed business data to identify trends and opportunities",
        "Built SQL queries for data extraction and validation",
        "Created 20+ reports supporting business decisions",
        "Cleaned and prepared datasets for analysis"
      ],
      skills_demonstrated: [
        "SQL",
        "Data Analysis",
        "Excel",
        "Data Visualization"
      ]
    }
  ],
  education: [
    {
      institution: "Stanford University",
      degree: "Master",
      field_of_study: "Computer Science (Machine Learning)",
      graduation_year: 2017,
      gpa: "3.8/4.0",
      relevant_coursework: [
        "Machine Learning",
        "Statistical Learning",
        "Neural Networks",
        "Data Mining",
        "Applied Statistics"
      ]
    },
    {
      institution: "UC Berkeley",
      degree: "Bachelor",
      field_of_study: "Statistics",
      graduation_year: 2015,
      gpa: "3.6/4.0",
      relevant_coursework: [
        "Linear Algebra",
        "Probability Theory",
        "Mathematical Statistics",
        "Data Structures"
      ]
    }
  ],
  certifications: [
    {
      name: "AWS Certified Machine Learning - Specialty",
      issuer: "Amazon Web Services",
      issue_date: "2023-03",
      expiry_date: "2026-03",
      credential_url: "https://aws.amazon.com/certification/ml-specialty"
    },
    {
      name: "TensorFlow Developer Certificate",
      issuer: "Google",
      issue_date: "2022-06",
      expiry_date: null,
      credential_url: "https://www.tensorflow.org/certificate"
    }
  ],
  projects: [
    {
      name: "Customer Churn Prediction System",
      description: "Built end-to-end ML system predicting customer churn with 87% accuracy",
      category: "Machine Learning",
      target_roles: ["Data Scientist", "ML Engineer"],
      skills_used: ["Python", "Scikit-learn", "SQL", "Pandas"],
      keywords: ["Classification", "Feature Engineering", "Model Evaluation", "Business Impact"],
      priority: 10,
      url: "https://github.com/johndoe/churn-prediction",
      github_url: "https://github.com/johndoe/churn-prediction",
      metrics: "87% accuracy, $2.5M business value"
    },
    {
      name: "Real-time Data Analytics Dashboard",
      description: "Interactive dashboard for monitoring business metrics in real-time",
      category: "Data Visualization",
      target_roles: ["Data Scientist", "Analytics Engineer"],
      skills_used: ["Python", "Tableau", "SQL"],
      keywords: ["Dashboard", "Visualization", "Real-time Analytics"],
      priority: 9,
      url: "https://dashboard.example.com",
      github_url: null,
      metrics: "Used by 50+ stakeholders daily"
    },
    {
      name: "Natural Language Processing Text Classifier",
      description: "Deep learning model for classifying customer feedback",
      category: "NLP",
      target_roles: ["ML Engineer", "Data Scientist"],
      skills_used: ["Python", "TensorFlow", "NLP"],
      keywords: ["Deep Learning", "NLP", "Text Classification"],
      priority: 8,
      url: "https://github.com/johndoe/text-classifier",
      github_url: "https://github.com/johndoe/text-classifier",
      metrics: "94% F1-score on test set"
    }
  ],
  achievements: [
    "Published research paper on ML optimization in top-tier conference",
    "Presented at 5 industry conferences and meetups",
    "Open source contributor: 200+ GitHub stars on ML project",
    "Reduced model training time by 50% through algorithm optimization"
  ]
};

export const defaultInitialListings: JobListing[] = [
  {
    id: "job-001",
    title: "Senior Data Scientist",
    company: "TechCorp India",
    location: "Indore",
    url: "https://example.com/job/1001",
    description: "We are seeking a Senior Data Scientist to design and deploy end-to-end Machine Learning pipelines. Required skills: Python, Machine Learning, Data Analysis, SQL, and EDA. You will lead exploratory data analysis, build predictive statistical models, and collaborate with engineering teams on cloud infrastructure (AWS/GCP). Minimum 3+ years experience with strong background in statistics and data preprocessing.",
    source: "indeed",
    posted_at: "2026-08-28T09:00:00Z",
    fetched_at: "2026-09-01T08:00:00Z",
    fit_score: 88,
    fit_reason: "Keywords: 7/7 | Skills: 8/8"
  },
  {
    id: "job-002",
    title: "Lead Data Scientist - Machine Learning",
    company: "AI Innovations",
    location: "Remote",
    url: "https://example.com/job/1002",
    description: "Join our team as Lead Data Scientist. Must have strong background in Python, Deep Learning, Machine Learning algorithms, and Statistics. Knowledge of Tableau, SQL databases, and containerization with Docker is a plus. Contribute to data-driven decision making and mentor junior engineers.",
    source: "indeed",
    posted_at: "2026-08-29T14:30:00Z",
    fetched_at: "2026-09-01T08:00:00Z",
    fit_score: 82,
    fit_reason: "Keywords: 6/7 | Skills: 7/8"
  },
  {
    id: "job-003",
    title: "Data Scientist (Python & Statistics)",
    company: "Statistics Lab",
    location: "Indore",
    url: "https://example.com/job/1003",
    description: "Exciting opportunity for a Data Scientist in Indore. Skills needed: Python, Statistics, Data Preprocessing, Data Cleaning, and Data Visualization. Experience with Scikit-learn, Pandas, and exploratory data analysis required. Minimum 3+ years experience.",
    source: "stackoverflow",
    posted_at: "2026-08-30T11:15:00Z",
    fetched_at: "2026-09-01T08:00:00Z",
    fit_score: 95,
    fit_reason: "Keywords: 7/7 | Skills: 8/8"
  },
  {
    id: "job-004",
    title: "Machine Learning Engineer",
    company: "Neural Networks Ltd",
    location: "Remote",
    url: "https://example.com/job/1004",
    description: "Hiring ML Engineer with 3+ years experience. Expertise in machine learning, Python, PyTorch/TensorFlow, and feature engineering required. Work on real-time classification systems and ML model monitoring in production.",
    source: "github_jobs",
    posted_at: "2026-08-31T16:00:00Z",
    fetched_at: "2026-09-01T08:00:00Z",
    fit_score: 75,
    fit_reason: "Keywords: 5/7 | Skills: 6/8"
  },
  {
    id: "job-005",
    title: "Data Scientist - Analytics & BI",
    company: "Cloud Analytics",
    location: "Indore",
    url: "https://example.com/job/1005",
    description: "We are looking for a Data Scientist with experience in analytics, EDA, SQL, and Python. Required skills: Data Analysis, Data Cleaning, and Data Visualization with Tableau. Work with cross-functional stakeholders on executive KPI reports.",
    source: "indeed",
    posted_at: "2026-08-27T10:00:00Z",
    fetched_at: "2026-09-01T08:00:00Z",
    fit_score: 79,
    fit_reason: "Keywords: 6/7 | Skills: 6/8"
  },
  {
    id: "job-006",
    title: "Big Data & ML Specialist",
    company: "BigData Corp",
    location: "Remote",
    url: "https://example.com/job/1006",
    description: "Seeking Big Data ML Specialist with Spark, Kafka, Python, SQL, and AWS knowledge. Build distributed data pipelines and train large scale forecasting models.",
    source: "indeed",
    posted_at: "2026-08-26T08:45:00Z",
    fetched_at: "2026-09-01T08:00:00Z",
    fit_score: 62,
    fit_reason: "Keywords: 4/7 | Skills: 5/8"
  },
  {
    id: "job-007",
    title: "Data Analyst & Modeler",
    company: "Insight Analytics",
    location: "Indore",
    url: "https://example.com/job/1007",
    description: "Data Analyst position in Indore. Analyze customer data using Python, EDA, and Statistics. Knowledge of data preprocessing, Excel, and SQL required for daily analytics.",
    source: "indeed",
    posted_at: "2026-08-25T12:00:00Z",
    fetched_at: "2026-09-01T08:00:00Z",
    fit_score: 71,
    fit_reason: "Keywords: 5/7 | Skills: 6/8"
  },
  {
    id: "job-008",
    title: "Full Stack Data Developer",
    company: "DataFlow Systems",
    location: "Remote",
    url: "https://example.com/job/1008",
    description: "Looking for developer with React, Node.js, Python, and SQL background to build internal data tools and dashboard APIs.",
    source: "github_jobs",
    posted_at: "2026-08-24T15:20:00Z",
    fetched_at: "2026-09-01T08:00:00Z",
    fit_score: 45,
    fit_reason: "Keywords: 3/7 | Skills: 3/8"
  }
];

export const defaultSkillGaps: SkillGap[] = [
  { skill: "SQL", frequency: 28, last_seen: "2026-09-01" },
  { skill: "Tableau", frequency: 22, last_seen: "2026-09-01" },
  { skill: "AWS", frequency: 19, last_seen: "2026-09-01" },
  { skill: "Docker", frequency: 15, last_seen: "2026-09-01" },
  { skill: "Spark", frequency: 14, last_seen: "2026-09-01" },
  { skill: "Kubernetes", frequency: 11, last_seen: "2026-09-01" },
  { skill: "GCP", frequency: 9, last_seen: "2026-09-01" },
  { skill: "Kafka", frequency: 8, last_seen: "2026-09-01" },
  { skill: "Snowflake", frequency: 7, last_seen: "2026-09-01" },
  { skill: "Airflow", frequency: 6, last_seen: "2026-09-01" }
];
