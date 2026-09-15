import { CandidateProfile, Config, JobListing, SkillGap } from '../types';

export const getEmptyCandidateProfile = (fullName: string = '', email: string = ''): CandidateProfile => ({
  full_name: fullName,
  email: email,
  phone: '',
  location: '',
  summary: '',
  target_roles: [],
  github_url: '',
  linkedin_url: '',
  portfolio_url: '',
  skills: [],
  experience: [],
  education: [],
  certifications: [],
  projects: [],
  achievements: []
});

export const getEmptyConfig = (): Config => ({
  target_role: '',
  target_city: '',
  keywords: [],
  my_skills: [],
  experience_years: 0,
  min_fit_score: 0
});

export const defaultConfig: Config = {
  target_role: "Data Analyst",
  target_city: "Remote (Global / US / India)",
  keywords: [
    "Data Analysis",
    "Python",
    "SQL",
    "Power BI",
    "Tableau",
    "Machine Learning",
    "EDA",
    "Business Analytics",
    "ETL Pipelines"
  ],
  my_skills: [
    "Python",
    "SQL",
    "Power BI",
    "Tableau",
    "Data Analysis",
    "Data Cleaning",
    "Exploratory Data Analysis (EDA)",
    "Data Visualization",
    "Business Analytics",
    "ETL Pipelines",
    "Machine Learning"
  ],
  experience_years: 3,
  min_fit_score: 30
};

export const defaultCandidateProfile: CandidateProfile = {
  full_name: "Alex Morgan",
  email: "alex.morgan.demo@example.com",
  phone: "+1 (555) 234-8901",
  location: "San Francisco, CA / Remote",
  summary: "Results-driven Data Analyst and BI Specialist with 3+ years of experience in SQL querying, Python data analysis, interactive dashboard engineering (Power BI, Tableau), and predictive modeling. Proven track record of developing automated ETL pipelines, optimizing query performance by 35%, and translating complex customer telemetry into actionable growth strategies.",
  target_roles: [
    "Data Analyst",
    "Business Intelligence Analyst",
    "Analytics Engineer",
    "Product Analyst",
    "Data Scientist"
  ],
  github_url: "https://github.com/alexmorgan-data-demo",
  linkedin_url: "https://www.linkedin.com/in/alex-morgan-analytics-demo",
  portfolio_url: "https://alexmorgan-analytics.example.com",
  skills: [
    { skill_name: "Python", proficiency: "Expert", years_of_experience: 3, category: "Technical", endorsements: 48 },
    { skill_name: "SQL", proficiency: "Expert", years_of_experience: 3, category: "Technical", endorsements: 52 },
    { skill_name: "Power BI", proficiency: "Expert", years_of_experience: 3, category: "Technical", endorsements: 44 },
    { skill_name: "Tableau", proficiency: "Advanced", years_of_experience: 2, category: "Technical", endorsements: 38 },
    { skill_name: "Data Analysis", proficiency: "Expert", years_of_experience: 3, category: "Technical", endorsements: 50 },
    { skill_name: "Data Cleaning", proficiency: "Expert", years_of_experience: 3, category: "Technical", endorsements: 42 },
    { skill_name: "Exploratory Data Analysis (EDA)", proficiency: "Expert", years_of_experience: 3, category: "Technical", endorsements: 46 },
    { skill_name: "Data Visualization", proficiency: "Expert", years_of_experience: 3, category: "Technical", endorsements: 45 },
    { skill_name: "Business Analytics", proficiency: "Advanced", years_of_experience: 3, category: "Analytical", endorsements: 40 },
    { skill_name: "Customer Analytics", proficiency: "Advanced", years_of_experience: 2, category: "Analytical", endorsements: 32 },
    { skill_name: "Data Modeling", proficiency: "Advanced", years_of_experience: 2, category: "Technical", endorsements: 36 },
    { skill_name: "ETL Pipelines", proficiency: "Advanced", years_of_experience: 2, category: "Technical", endorsements: 34 },
    { skill_name: "Machine Learning", proficiency: "Intermediate", years_of_experience: 2, category: "AI / ML", endorsements: 30 },
    { skill_name: "Generative AI", proficiency: "Intermediate", years_of_experience: 1, category: "AI / ML", endorsements: 28 },
    { skill_name: "Statistical Inference", proficiency: "Advanced", years_of_experience: 2, category: "Analytical", endorsements: 35 },
    { skill_name: "PostgreSQL", proficiency: "Advanced", years_of_experience: 3, category: "Database", endorsements: 41 },
    { skill_name: "Git & GitHub", proficiency: "Advanced", years_of_experience: 3, category: "Tools", endorsements: 39 },
    { skill_name: "Problem Solving", proficiency: "Expert", years_of_experience: 3, category: "Core", endorsements: 45 },
    { skill_name: "ATS Optimization", proficiency: "Advanced", years_of_experience: 2, category: "Career / Technical", endorsements: 33 }
  ],
  experience: [
    {
      company: "Nexus Analytics Global",
      job_title: "Senior Data & BI Analyst",
      start_date: "2023-01",
      end_date: null,
      description: "Led analytics infrastructure, automated pipeline engineering, and executive BI reporting across high-growth product lines.",
      location: "Remote",
      responsibilities: [
        "Architected automated SQL pipelines processing 2.5M+ daily transaction records, reducing runtime latency by 35%.",
        "Designed and maintained 15+ executive Power BI and Tableau dashboards tracking ARR, customer churn, and cohort retention.",
        "Partnered with product and growth teams to formulate statistical A/B test hypotheses, increasing user conversion by 12%."
      ],
      skills_demonstrated: [
        "SQL",
        "Power BI",
        "Tableau",
        "Python",
        "Data Modeling",
        "A/B Testing"
      ]
    },
    {
      company: "CloudWave Technologies",
      job_title: "Data Analyst & Reporting Specialist",
      start_date: "2021-06",
      end_date: "2022-12",
      description: "Managed data cleaning, exploratory analysis, and automated business KPI reporting for enterprise SaaS customers.",
      location: "San Francisco, CA / Hybrid",
      responsibilities: [
        "Conducted deep-dive exploratory data analysis (EDA) using Python (Pandas, NumPy) to isolate bottlenecks in customer onboarding.",
        "Built automated reporting routines in Python and SQL, eliminating 12 hours of weekly manual compilation.",
        "Collaborated with data engineering to clean and validate incoming event streams across PostgreSQL and BigQuery."
      ],
      skills_demonstrated: [
        "Python",
        "SQL",
        "PostgreSQL",
        "Data Cleaning",
        "EDA",
        "KPI Reporting"
      ]
    },
    {
      company: "Apex Global Insights",
      job_title: "Junior Analytics Associate (Internship)",
      start_date: "2020-08",
      end_date: "2021-05",
      description: "Supported senior analysts with statistical queries, market benchmark reports, and client visualization decks.",
      location: "Remote",
      responsibilities: [
        "Wrote optimized SQL queries for daily and monthly client performance benchmarks.",
        "Created interactive charts and visual exhibits in Tableau for executive quarterly reviews.",
        "Assisted with data validation and cleansing for multi-source marketing data."
      ],
      skills_demonstrated: [
        "SQL",
        "Tableau",
        "Excel",
        "Data Validation",
        "Market Research"
      ]
    }
  ],
  education: [
    {
      institution: "University of California, Berkeley (Extension)",
      degree: "Professional Certificate in Applied Data Science & Analytics",
      field_of_study: "Data Science & Machine Learning",
      graduation_year: 2023,
      gpa: "Distinction",
      relevant_coursework: [
        "Advanced SQL",
        "Predictive Modeling",
        "Data Mining",
        "Statistical Inference"
      ]
    },
    {
      institution: "State University of Technology",
      degree: "Bachelor of Science",
      field_of_study: "Computer Science & Information Systems",
      graduation_year: 2021,
      gpa: "3.8 / 4.0",
      relevant_coursework: [
        "Database Management Systems",
        "Data Structures & Algorithms",
        "Applied Statistics",
        "Linear Algebra"
      ]
    }
  ],
  certifications: [
    {
      name: "Google Advanced Data Analytics Professional Certificate",
      issuer: "Google / Coursera",
      issue_date: "2023-08",
      expiry_date: null,
      credential_url: ""
    },
    {
      name: "Microsoft Certified: Power BI Data Analyst Associate (PL-300)",
      issuer: "Microsoft",
      issue_date: "2023-03",
      expiry_date: null,
      credential_url: ""
    },
    {
      name: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services (AWS)",
      issue_date: "2022-11",
      expiry_date: null,
      credential_url: ""
    },
    {
      name: "IBM Data Analyst Professional Certificate",
      issuer: "IBM",
      issue_date: "2022-04",
      expiry_date: null,
      credential_url: ""
    }
  ],
  projects: [
    {
      name: "SaaS Retention & Churn Prediction System",
      description: "Engineered an end-to-end predictive machine learning model identifying at-risk accounts with 89% precision.",
      category: "Predictive Analytics",
      target_roles: ["Data Analyst", "Data Scientist"],
      skills_used: ["Python", "Scikit-learn", "SQL", "Streamlit"],
      keywords: ["Churn Prediction", "Retention Modeling", "Machine Learning", "Python"],
      priority: 10,
      url: "",
      github_url: null,
      metrics: "Flagged early churn signals saving an estimated $140,000 in annualized recurring revenue"
    },
    {
      name: "E-Commerce Revenue & Cohort Intelligence Platform",
      description: "Designed a real-time cohort analysis dashboard tracking customer retention curves, average order value, and lifetime value.",
      category: "Business Intelligence",
      target_roles: ["Data Analyst", "Analytics Engineer"],
      skills_used: ["SQL", "Power BI", "Python", "PostgreSQL"],
      keywords: ["Cohort Analysis", "Power BI", "LTV", "Dashboard"],
      priority: 9,
      url: "",
      github_url: null,
      metrics: "Processed 1.2M+ historical transactions with sub-second dashboard query performance"
    },
    {
      name: "Automated Multi-Channel Marketing Attribution Pipeline",
      description: "Built automated data workflows unifying Google Ads, Meta Ads, and Stripe revenue data into a normalized data mart.",
      category: "Data Engineering & Analytics",
      target_roles: ["Data Analyst", "Analytics Engineer"],
      skills_used: ["Python", "SQL", "PostgreSQL", "REST APIs"],
      keywords: ["Attribution", "ETL", "Automation", "Marketing Analytics"],
      priority: 8,
      url: "",
      github_url: null,
      metrics: "Eliminated 10+ hours per week of manual cross-platform spreadsheet reconciliation"
    }
  ],
  achievements: [
    "Over 3 years of hands-on experience designing production BI dashboards, automated SQL pipelines, and predictive models.",
    "Certified Power BI Data Analyst Associate and Google Advanced Data Analytics professional.",
    "Proven track record of optimizing data warehouse queries, cutting run times by up to 35%.",
    "Deep domain experience analyzing SaaS unit economics, cohort retention, and conversion funnels."
  ]
};

export const defaultInitialListings: JobListing[] = [
  {
    id: "jobicy-150206",
    title: "Staff Data Scientist - Ads Measurement, Signals & Analytics",
    company: "Reddit",
    location: "Remote",
    url: "https://jobicy.com/jobs/150206-staff-data-scientist-ads-measurement-signals-privacy",
    description: "Reddit's Ads Data Science team is looking for a Staff Data Scientist to advance the intelligence powering advertiser experiences. Responsibilities: design probabilistic models for identity resolution, advance experimentation methodologies, build causal inference and A/B testing frameworks, maximize signals for predictive modeling, and lead cross-functional analytics. Requirements: advanced degree in Statistics, Data Science or related field; hands-on expertise in Python, SQL, statistical modeling, machine learning, and data pipelines.",
    source: "Jobicy (Live API)",
    posted_at: "2026-09-05T05:35:10Z",
    fetched_at: "2026-09-05T08:00:00Z",
    fit_score: 96,
    fit_reason: "Keywords: 8/9 | Skills: 10/11"
  },
  {
    id: "jobicy-150923",
    title: "Data Analyst, Clinical & Business Analytics",
    company: "Clover Health",
    location: "Remote",
    url: "https://jobicy.com/jobs/150923-data-analyst-clinical-data-effectiveness",
    description: "Seeking a Data Analyst to join our team. Responsibilities include building automated data cleaning workflows, developing interactive Power BI and SQL dashboards, running exploratory data analysis (EDA), and delivering actionable insights to stakeholders. Key requirements: Strong SQL proficiency, Python for data manipulation (pandas, numpy), data visualization, business analytics, and experience working with complex relational datasets.",
    source: "Jobicy (Live API)",
    posted_at: "2026-09-04T12:00:00Z",
    fetched_at: "2026-09-05T08:00:00Z",
    fit_score: 93,
    fit_reason: "Keywords: 9/9 | Skills: 11/11"
  },
  {
    id: "remotive-2091097",
    title: "Senior Data & Analytics Engineer",
    company: "Lemon.io",
    location: "Remote / Worldwide",
    url: "https://remotive.com/remote-jobs/software-development/senior-data-engineer-2091097",
    description: "Lemon.io is looking for a Senior Data & Analytics Specialist with extensive hands-on experience in Python, SQL, data pipelines, automated reporting, and analytical modeling. You will work on architecting scalable data schemas, optimizing SQL query performance, integrating API data sources, and building analytics dashboards for international clients.",
    source: "Remotive (Live API)",
    posted_at: "2026-09-03T16:45:00Z",
    fetched_at: "2026-09-05T08:00:00Z",
    fit_score: 89,
    fit_reason: "Keywords: 7/9 | Skills: 9/11"
  },
  {
    id: "in-razorpay-001",
    title: "Data Analyst - Business Intelligence & Growth",
    company: "Razorpay",
    location: "Bengaluru / Remote",
    url: "https://razorpay.com/jobs/",
    description: "Razorpay is hiring Data Analysts for Business Intelligence and Product Analytics. In this role, you will be responsible for defining KPIs, creating interactive Power BI and Metabase dashboards, writing complex SQL queries for transaction trend analysis, performing deep-dive exploratory data analysis (EDA) using Python, and collaborating with product leaders to automate business decisions.",
    source: "Razorpay Careers (Direct)",
    posted_at: "2026-09-02T10:00:00Z",
    fetched_at: "2026-09-05T08:00:00Z",
    fit_score: 94,
    fit_reason: "Keywords: 8/9 | Skills: 10/11"
  },
  {
    id: "in-swiggy-002",
    title: "Associate Data Scientist - AI & Automation",
    company: "Swiggy",
    location: "Bengaluru / Hybrid",
    url: "https://careers.swiggy.com/",
    description: "Swiggy's analytics organization is seeking an Associate Data Scientist. Key focus areas: predictive modeling, feature engineering with Python, Generative AI agent workflows, anomaly detection in delivery logistics, and SQL database querying. Strong foundation in machine learning, statistics, data cleaning, and workflow automation required.",
    source: "Swiggy Careers (Direct)",
    posted_at: "2026-09-01T14:20:00Z",
    fetched_at: "2026-09-05T08:00:00Z",
    fit_score: 87,
    fit_reason: "Keywords: 7/9 | Skills: 8/11"
  },
  {
    id: "jobicy-150136",
    title: "Data Operations & Infrastructure Analyst",
    company: "Nebius",
    location: "Remote",
    url: "https://jobicy.com/jobs/150136-field-technical-lead-data-center-deployments",
    description: "Nebius is expanding AI and cloud data operations. This role focuses on telemetry analysis, data validation pipelines, tracking SLA metrics with Python and SQL, and visualizing server telemetry in real-time dashboards. Requires proficiency with Python scripting, data cleaning, Git, and automated reporting.",
    source: "Jobicy (Live API)",
    posted_at: "2026-08-31T09:15:00Z",
    fetched_at: "2026-09-05T08:00:00Z",
    fit_score: 81,
    fit_reason: "Keywords: 6/9 | Skills: 7/11"
  },
  {
    id: "in-zepto-003",
    title: "Junior Data Analyst - Supply Chain Intelligence",
    company: "Zepto",
    location: "Mumbai / Remote",
    url: "https://www.zeptonow.com/careers",
    description: "Zepto is hiring a Junior Data Analyst to work with dark store data, order frequency trends, and customer purchase patterns. Tools used: SQL (Postgres), Python (Pandas/Seaborn), Power BI, and Google Sheets automation. Fast-paced, high impact environment.",
    source: "Zepto Careers (Direct)",
    posted_at: "2026-08-30T11:00:00Z",
    fetched_at: "2026-09-05T08:00:00Z",
    fit_score: 91,
    fit_reason: "Keywords: 8/9 | Skills: 10/11"
  },
  {
    id: "remotive-1919266",
    title: "AI & Machine Learning Data Specialist",
    company: "A.Team",
    location: "Remote / Worldwide",
    url: "https://remotive.com/remote-jobs/software-development/senior-independent-ai-engineer-architect-1919266",
    description: "Join high-performing distributed builder teams deploying real-world generative AI and data analytics systems. Expertise required in Python, ML model fine-tuning, prompt engineering, data cleaning, and REST API integration.",
    source: "Remotive (Live API)",
    posted_at: "2026-08-29T18:30:00Z",
    fetched_at: "2026-09-05T08:00:00Z",
    fit_score: 85,
    fit_reason: "Keywords: 7/9 | Skills: 8/11"
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
