# EdgeDash: AI Career Intelligence Platform & 9-Agent Autonomous Orchestrator

**EdgeDash** is an AI-powered career intelligence and automated resume-tailoring platform. It connects directly with real-world job boards, extracts market skill requirements, scores candidate alignment, and generates **100% verified, zero-hallucination, ATS-optimized resumes** tailored to each job description.

---

## 🌟 Key Capabilities

### 1. Live Job Discovery & Real-Time Ingestion
- **Live Internet Job Finder**: Queries public hiring APIs (**Remotive**, **Arbeitnow**) for active worldwide opportunities.
- **Custom Job Importer**: Paste job descriptions from LinkedIn, Naukri, Indeed, or company career pages for instant automated analysis.
- **Direct Application Links**: Quick-access links to view and apply on official job postings.

### 2. The 9 Autonomous AI Agents Architecture
EdgeDash executes a sequential 9-agent pipeline to process market data and generate high-impact applications:

```
                  ┌──────────────────────────────────────────────┐
                  │          9-Agent Autonomous Engine           │
                  └──────────────────────┬───────────────────────┘
                                         │
       ┌─────────────────────────────────┴─────────────────────────────────┐
       ▼                                                                   ▼
[ Discovery & Market Intelligence ]                       [ Resume Intelligence & Synthesis ]
1. Indeed & Public Job Fetcher                            5. JD Requirement Extractor
   (Ingests live listings & deduplicates)                    (Seniority, tools & responsibilities)
2. Fit Scorer                                             6. Multi-Factor Resume Matcher
   (30% keyword match + 70% skill alignment)                 (Multi-dimensional profile fit %)
3. Skill Gap Analyzer                                     7. Anti-Hallucination Generator
   (Identifies in-demand market competencies)                (Synthesizes resume strictly from facts)
4. Data Verifier & QA                                     8. Fact & Claim Validator
   (Validates data ranges & consistency)                     (100% adherence audit to master profile)
                                                          9. ATS Compatibility Optimizer
                                                             (Formatting, headers & keyword density)
```

### 3. Anti-Hallucination & Zero-Falsification Guarantee
Unlike generic LLM resume tools that invent unverified facts, EdgeDash uses a strict **Master Profile Single Source of Truth**. The generator only incorporates projects, verified skills, and experience lines already present in the candidate profile, ensuring complete truthfulness in hiring interviews.

### 4. Interactive Analytics & Roadmaps
- **Skill Gaps Dashboard**: Frequency distribution of high-demand skills missing from candidate profile with one-click *"Add to Profile"*.
- **Fit Score Distribution**: Visual breakdown of Good, Hot, and Moderate matches.
- **Actionable Strategic Insights**: Priority learning pathways and market recommendations.

### 5. Multi-Format Resume Exporter
- **Print / PDF Direct Export**: Clean, print-ready document formatted for ATS scanners.
- **Formatted Plain Text (TXT)**: Clean layout for online application forms.
- **Styled HTML**: Portable rich document.

---

## 📂 Project Structure

```
├── .env.example              # Environment variables template
├── index.html                # Main application HTML entry point
├── metadata.json             # App configuration & permissions
├── package.json              # Project dependencies and npm scripts
├── README.md                 # Complete project documentation
├── tsconfig.json             # TypeScript compiler settings
├── vite.config.ts            # Vite bundler configuration
└── src/
    ├── main.tsx              # React entry point
    ├── App.tsx               # Root application component & state router
    ├── index.css             # Tailwind CSS styles
    ├── types.ts              # Universal TypeScript data interfaces
    ├── data/
    │   └── defaultData.ts    # Seed candidate profile, default config & demo jobs
    ├── services/
    │   ├── agents.ts         # Complete 9-Agent autonomous engine implementation
    │   └── liveJobsService.ts# Real-time Public Job APIs client (Remotive, Arbeitnow)
    └── components/
        ├── Navbar.tsx                # Header navigation & quick-action triggers
        ├── TopJobsTab.tsx            # Live job search, filters, score threshold & cards
        ├── SkillGapsTab.tsx          # Market demand charts & prioritized roadmap
        ├── StatisticsTab.tsx         # Fit score distributions & source metrics
        ├── InsightsTab.tsx           # Strategic recommendations & actionable steps
        ├── ResumeIntelligenceTab.tsx # 5-step ATS resume generator, validator & exporter
        ├── AgentCycleModal.tsx       # Live 9-agent execution runner & terminal stream
        ├── CandidateProfileModal.tsx # Master profile editor (Skills, Experience, Projects)
        └── AddJobModal.tsx           # Custom job description input & instant scorer
```

---

## 🚀 Future Roadmap & Planned Improvements

The following high-value features are planned for upcoming releases:

1. **Cover Letter & Cold Email Outreach Generator**
   - Automatically draft personalized, tailored cover letters matching the target job description.
   - Generate high-converting LinkedIn connection notes and cold emails addressed to hiring managers.

2. **Interactive Job Application Tracker (Kanban Board)**
   - Visual Kanban pipeline to manage application stages (`Saved` ➔ `Applied` ➔ `Interview Scheduled` ➔ `Offer Received`).
   - Add custom notes, application dates, salary offers, and follow-up reminders.

3. **AI Interview Preparation Coach**
   - Extract expected technical, domain, and behavioral questions specific to the job description.
   - Provide recommended talking points highlighting the candidate's verified projects.

4. **Multi-Template Resume Layouts**
   - Switchable resume styling presets:
     - *Modern Minimalist* (Clean sans-serif with subtle accents)
     - *Single-Column Tech Standard* (Optimized for engineering ATS parsers)
     - *Harvard Academic Classic* (Traditional serif typography)

5. **Automated Market Alerts & Email Notifications**
   - Periodic background checks for high-fit job matches (e.g. Fit Score ≥ 80%) with direct notification dispatch.

---

## 🛠️ Technology Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS (Dark theme with accessible contrast)
- **Icons**: Lucide React
- **Data Visualization**: Recharts & responsive SVG indicators
- **Build System**: Vite
- **Job Sources**: Remotive API, Arbeitnow API, Custom Paste Ingestion

---

## 💻 Getting Started

### Installation
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
The app will be accessible at `http://localhost:3000`.

### Production Build
```bash
npm run build
```

---

## 📄 License
MIT License. Built for autonomous job discovery, market skill gap analysis, and trustworthy resume synthesis.
