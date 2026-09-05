import { CandidateProfile, Config, JobListing, SkillGap } from '../types';

export const defaultConfig: Config = {
  target_role: "Data Analyst",
  target_city: "Satna, Madhya Pradesh",
  keywords: [
    "Data Analysis",
    "Python",
    "SQL",
    "Power BI",
    "Machine Learning",
    "Generative AI",
    "EDA",
    "AI Automation",
    "Business Analytics"
  ],
  my_skills: [
    "Python",
    "SQL",
    "Power BI",
    "Data Analysis",
    "Data Cleaning",
    "Exploratory Data Analysis (EDA)",
    "Data Visualization",
    "Business Analytics",
    "Generative AI",
    "Machine Learning",
    "AI Automation"
  ],
  experience_years: 2,
  min_fit_score: 55
};

export const defaultCandidateProfile: CandidateProfile = {
  full_name: "Aman Kumar Yadav",
  email: "aman895980@gmail.com",
  phone: "8959803686",
  location: "Satna, Madhya Pradesh, India",
  summary: "Data Analyst and AI Automation Developer with hands-on experience in data cleaning, analysis, visualization, Power BI dashboards, Python, SQL, Generative AI, and workflow automation. Experienced in working with real-world datasets, developing data-driven solutions, building AI-powered applications, and creating practical business analytics solutions. Currently building professional experience through internships, freelance projects, and real-world data and AI applications.",
  target_roles: [
    "Data Analyst",
    "Data Scientist",
    "AI Automation Developer",
    "Machine Learning Engineer",
    "Analytics Engineer"
  ],
  github_url: "",
  linkedin_url: "https://www.linkedin.com/in/aman-kumar-yadav-ds",
  portfolio_url: "",
  skills: [
    { skill_name: "Python", proficiency: "Expert", years_of_experience: 3, category: "Technical", endorsements: 45 },
    { skill_name: "SQL", proficiency: "Advanced", years_of_experience: 2, category: "Technical", endorsements: 38 },
    { skill_name: "Power BI", proficiency: "Advanced", years_of_experience: 2, category: "Technical", endorsements: 36 },
    { skill_name: "Data Analysis", proficiency: "Expert", years_of_experience: 3, category: "Technical", endorsements: 42 },
    { skill_name: "Data Cleaning", proficiency: "Expert", years_of_experience: 2, category: "Technical", endorsements: 35 },
    { skill_name: "Exploratory Data Analysis (EDA)", proficiency: "Expert", years_of_experience: 2, category: "Technical", endorsements: 39 },
    { skill_name: "Data Visualization", proficiency: "Advanced", years_of_experience: 2, category: "Technical", endorsements: 34 },
    { skill_name: "Business Analytics", proficiency: "Advanced", years_of_experience: 2, category: "Analytical", endorsements: 30 },
    { skill_name: "Customer Analytics", proficiency: "Intermediate", years_of_experience: 1, category: "Analytical", endorsements: 22 },
    { skill_name: "Data Management", proficiency: "Advanced", years_of_experience: 2, category: "Technical", endorsements: 28 },
    { skill_name: "Generative AI", proficiency: "Advanced", years_of_experience: 2, category: "AI / ML", endorsements: 35 },
    { skill_name: "Machine Learning", proficiency: "Intermediate", years_of_experience: 2, category: "AI / ML", endorsements: 32 },
    { skill_name: "AI Automation", proficiency: "Advanced", years_of_experience: 2, category: "AI / ML", endorsements: 33 },
    { skill_name: "LLM/API-based Applications", proficiency: "Advanced", years_of_experience: 2, category: "AI / ML", endorsements: 31 },
    { skill_name: "Workflow Automation", proficiency: "Advanced", years_of_experience: 2, category: "Technical", endorsements: 29 },
    { skill_name: "Java", proficiency: "Intermediate", years_of_experience: 1, category: "Programming", endorsements: 25 },
    { skill_name: "Object-Oriented Programming (OOP)", proficiency: "Advanced", years_of_experience: 2, category: "Programming", endorsements: 27 },
    { skill_name: "Programming Fundamentals", proficiency: "Expert", years_of_experience: 3, category: "Programming", endorsements: 36 },
    { skill_name: "Problem Solving", proficiency: "Expert", years_of_experience: 3, category: "Analytical", endorsements: 40 },
    { skill_name: "React.js", proficiency: "Intermediate", years_of_experience: 1, category: "Web Development", endorsements: 20 },
    { skill_name: "Full-Stack Development", proficiency: "Intermediate", years_of_experience: 1, category: "Web Development", endorsements: 22 },
    { skill_name: "Database Integration", proficiency: "Advanced", years_of_experience: 2, category: "Technical", endorsements: 26 },
    { skill_name: "ATS Optimization", proficiency: "Advanced", years_of_experience: 2, category: "Career / Technical", endorsements: 30 }
  ],
  experience: [
    {
      company: "YuvaIntern",
      job_title: "Virtual Data Science with Python Trainee",
      start_date: "2026-08",
      end_date: null,
      description: "Data Science with Python trainee focused on applying Python and data science concepts through practical, real-world datasets and collaborative projects.",
      location: "Remote",
      responsibilities: [
        "Conducted hands-on projects using real-world datasets to apply theoretical knowledge.",
        "Enhanced Python programming skills through practical applications in data science.",
        "Collaborated with a dynamic team and contributed to a supportive learning environment."
      ],
      skills_demonstrated: [
        "Python",
        "Data Science",
        "Data Analysis",
        "EDA",
        "Machine Learning"
      ]
    },
    {
      company: "Nirmaan Mega Venture",
      job_title: "Data Management Analyst",
      start_date: "2024-08",
      end_date: null,
      description: "Responsible for data collection, validation, analysis, visualization, dashboard development, and reporting automation to support data-driven decision-making.",
      location: "Satna, Madhya Pradesh",
      responsibilities: [
        "Collected and validated data to ensure accuracy for informed decision-making.",
        "Conducted exploratory data analysis to identify trends and insights.",
        "Developed interactive dashboards that enhanced data visualization and accessibility.",
        "Automated reporting tasks, improving efficiency and collaboration across teams."
      ],
      skills_demonstrated: [
        "Data Management",
        "Data Validation",
        "Data Analysis",
        "Power BI",
        "Dashboard Development",
        "Reporting Automation"
      ]
    },
    {
      company: "InAmigos Foundation (IAF)",
      job_title: "AI Data Analytics",
      start_date: "2026-08",
      end_date: "2026-08",
      description: "Worked on AI and Data Analytics activities as part of an internship in a startup environment.",
      location: "India",
      responsibilities: [
        "Engaged in AI and Data Analytics tasks as part of an internship.",
        "Collaborated in team meetings and group discussions to enhance project outcomes.",
        "Completed assigned responsibilities efficiently in a professional setting.",
        "Developed skills in teamwork, AI, and data analytics."
      ],
      skills_demonstrated: [
        "AI",
        "Data Analytics",
        "Team Collaboration",
        "Problem Solving"
      ]
    },
    {
      company: "Riddhi Dance Studio",
      job_title: "Freelance Full-Stack Developer",
      start_date: "2026-08",
      end_date: "2026-08",
      description: "Developed a comprehensive full-stack web project for Riddhi Dance Studio, managing frontend, backend, database integration, and deployment.",
      location: "Satna, Madhya Pradesh",
      responsibilities: [
        "Developed a comprehensive full-stack web project managing frontend, backend, and deployment.",
        "Integrated databases to ensure seamless data flow and responsive user experience.",
        "Oversaw deployment processes and hosting configuration.",
        "Developed the application strictly according to real-world business requirements."
      ],
      skills_demonstrated: [
        "React.js",
        "Full-Stack Development",
        "Database Integration",
        "Web Deployment",
        "JavaScript"
      ]
    },
    {
      company: "CODTECH IT SOLUTIONS",
      job_title: "Intern – Java Programming",
      start_date: "2025-11",
      end_date: "2026-01",
      description: "Completed a Java Programming Internship focused on strengthening Java programming skills, practical knowledge, problem-solving abilities, OOP concepts, and professional development.",
      location: "Hyderabad, India",
      responsibilities: [
        "Strengthened Java programming skills through practical assignments.",
        "Developed practical knowledge of Object-Oriented Programming (OOP).",
        "Improved problem-solving fundamentals and algorithm implementation.",
        "Worked through assignments, collaboration, and hands-on learning.",
        "Successfully completed the Java Programming Internship with excellence."
      ],
      skills_demonstrated: [
        "Java",
        "OOP",
        "Programming Fundamentals",
        "Problem Solving",
        "Software Development"
      ]
    }
  ],
  education: [
    {
      institution: "Indian Institute of Technology, Roorkee",
      degree: "Advance AI and Data Science Diploma",
      field_of_study: "AI & Data Science",
      graduation_year: 2026,
      gpa: "Pursuing (2026-02 to 2026-10)",
      relevant_coursework: [
        "Advance AI",
        "Data Science",
        "Machine Learning",
        "Deep Learning",
        "Generative AI"
      ]
    },
    {
      institution: "AKS University, Satna (M.P.)",
      degree: "Bachelor of Science",
      field_of_study: "Information Technology",
      graduation_year: 2026,
      gpa: "2023-07 to 2026-07",
      relevant_coursework: [
        "Information Technology",
        "Database Management",
        "Data Structures",
        "Programming",
        "Web Technologies"
      ]
    },
    {
      institution: "Govt. Venkat Hr. Sec. Excellence School No. 1, Satna",
      degree: "12th – PCM",
      field_of_study: "Physics, Chemistry, Mathematics",
      graduation_year: 2019,
      gpa: "2018-07 to 2019-06",
      relevant_coursework: [
        "Mathematics",
        "Physics",
        "Chemistry"
      ]
    },
    {
      institution: "Govt. Venkat Hr. Sec. Excellence School No. 1, Satna",
      degree: "10th",
      field_of_study: "General / Science",
      graduation_year: 2017,
      gpa: "2016-07 to 2017-06",
      relevant_coursework: [
        "Science",
        "Mathematics",
        "Social Studies"
      ]
    }
  ],
  certifications: [
    {
      name: "Data Visualisation: Empowering Business with Effective Insights",
      issuer: "Tata / Forage",
      issue_date: "2024-05",
      expiry_date: null,
      credential_url: ""
    },
    {
      name: "Tata – GenAI Powered Data Analytics Job Simulation",
      issuer: "Tata / Forage",
      issue_date: "2024-06",
      expiry_date: null,
      credential_url: ""
    },
    {
      name: "BCG – Data Science Job Simulation",
      issuer: "Boston Consulting Group (BCG) / Forage",
      issue_date: "2024-07",
      expiry_date: null,
      credential_url: ""
    },
    {
      name: "Problem-Driven AI: Real World Applications and Solution Frameworks",
      issuer: "AI Professional Program",
      issue_date: "2024-08",
      expiry_date: null,
      credential_url: ""
    },
    {
      name: "TCS iON Career Edge – Young Professional",
      issuer: "TCS iON",
      issue_date: "2024-04",
      expiry_date: null,
      credential_url: ""
    }
  ],
  projects: [
    {
      name: "AI-Powered Support Ticket Intelligence System",
      description: "Built an AI-powered support ticket intelligence system focused on analyzing support tickets and extracting useful insights.",
      category: "AI & Data Analytics",
      target_roles: ["AI Automation Developer", "Data Analyst", "Data Scientist"],
      skills_used: ["AI", "Generative AI", "Data Analytics", "LLM/API-based Applications", "Python"],
      keywords: ["Ticket Intelligence", "Generative AI", "LLM", "Data Analytics", "Insights"],
      priority: 10,
      url: "",
      github_url: null,
      metrics: "Applied AI and data-driven techniques to support practical business analysis"
    },
    {
      name: "Data Analysis & Business Trends Analysis",
      description: "Worked with large datasets to analyze data, identify business trends, and generate useful insights.",
      category: "Data Analysis",
      target_roles: ["Data Analyst", "Analytics Engineer", "Data Scientist"],
      skills_used: ["Python", "SQL", "Data Analysis", "Exploratory Data Analysis"],
      keywords: ["Business Trends", "Data Cleaning", "EDA", "Insights"],
      priority: 9,
      url: "",
      github_url: null,
      metrics: "Generated data-driven insights to understand trends and support business-oriented decision-making"
    },
    {
      name: "Interactive Business Dashboards",
      description: "Developed data-driven interactive dashboards for business and customer analytics.",
      category: "Business Intelligence",
      target_roles: ["Data Analyst", "Analytics Engineer"],
      skills_used: ["Power BI", "Data Visualization", "Business Analytics", "Customer Analytics"],
      keywords: ["Power BI", "Dashboards", "Business Analytics", "Customer Analytics"],
      priority: 8,
      url: "",
      github_url: null,
      metrics: "Created accessible visual reports to communicate data insights effectively"
    },
    {
      name: "Machine Learning Solutions",
      description: "Worked on practical machine learning solutions using real-world data and data science techniques.",
      category: "Machine Learning",
      target_roles: ["Machine Learning Engineer", "Data Scientist"],
      skills_used: ["Python", "Machine Learning", "Data Science"],
      keywords: ["Predictive Models", "Machine Learning", "Data Science"],
      priority: 8,
      url: "",
      github_url: null,
      metrics: "Developed data-driven solutions as part of hands-on learning and professional projects"
    }
  ],
  achievements: [
    "Hands-on experience with real-world datasets across data cleaning, analysis, and visualization.",
    "Experience in data collection, validation, exploratory data analysis, and Power BI interactive dashboards.",
    "Experience with AI, Generative AI applications, LLM/API-based apps, and workflow automation.",
    "Built AI-powered support ticket intelligence system for business analytics.",
    "Experience in full-stack web development with database integration and deployment.",
    "Internship experience across Data Science, AI Data Analytics, and Java Programming.",
    "Currently pursuing Advance AI and Data Science Diploma from Indian Institute of Technology, Roorkee."
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
